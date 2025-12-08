import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'
import { resolve, join } from 'node:path'
import { readdir, writeFile, unlink, rename } from 'node:fs/promises'
import { isFile } from './utils/fs-utils.js'


const USAGE = `
Usage: npx mediasnacks queuedir [folder]

Sequentially runs all *.sh files in a folder. 
It uses the current working directory by default.

-h, --help
`.trim()


async function main() {
	const { values, positionals } = parseArgs({
		options: {
			help: { short: 'h', type: 'boolean', default: false },
		},
		allowPositionals: true,
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	const dir = positionals[0] || process.cwd()
	const err = await queueDir(dir)
	if (err)
		throw new Error(err)
}


async function queueDir(dir, pollIntervalMs = 10_000) {
	const lock = join(dir, '.lock')

	if (isFile(lock))
		return 'Found lockfile'

	while (true) {
		if (isFile(lock)) {
			await sleep(pollIntervalMs)
			continue
		}

		const job = await getNextJob(dir)
		if (!job)
			return null

		const jobName = job.split('/').pop()
		await writeFile(lock, jobName, 'utf8')

		try {
			const exitCode = await runShell(job)
			if (exitCode === 0)
				await rename(job, job.replace(/\.sh$/, '.done'))
			else
				await rename(job, job + `.failed.${exitCode}`)
		}
		finally {
			await unlink(lock).catch(() => {})
		}
	}
}

async function getNextJob(dir) {
	const entries = await readdir(dir, { withFileTypes: true })
	const scripts = entries
		.filter(d => d.isFile() && d.name.endsWith('.sh'))
		.map(d => d.name)
		.sort()
	return scripts.length 
		? join(dir, scripts[0]) 
		: null
}


async function runShell(scriptPath) {
	return new Promise((resolve, reject) => {
		const p = spawn('/bin/sh', [scriptPath], { stdio: 'inherit' })
		p.on('error', reject)
		p.on('exit', code => resolve(code))
	})
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(err => {
	console.error(err.message || err)
	process.exit(1)
})
