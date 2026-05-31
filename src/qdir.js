import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { readdir, writeFile, unlink, rename } from 'node:fs/promises'

import { isFile } from './utils/fs-utils.js'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks qdir [folder]

DESCRIPTION
  Sequentially runs all *.sh files in a folder (cwd by default). 
  Completed scripts get renamed with a ".done" extension,
  or to ".failed.$exitCode"
`.trim()


function filter(f) {
	return f.endsWith('.sh')
}

function newExt(exitCode) {
	return exitCode === 0
		? '.done'
		: `.failed.${exitCode}`
}


export default async function main() {
	const { values, positionals } = await parseOptions({
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	const dir = positionals[0] || process.cwd()
	const err = await qdir(dir)
	if (err)
		throw new Error(err)
}


export async function qdir(dir, pollIntervalMs = 10_000) {
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
			await rename(job, job + newExt(exitCode))
		}
		finally {
			await unlink(lock).catch(() => {})
		}
	}
}

async function getNextJob(dir) {
	const entries = await readdir(dir, { withFileTypes: true })
	const scripts = entries
		.filter(entry => entry.isFile() && filter(entry.name))
		.map(entry => entry.name)
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
