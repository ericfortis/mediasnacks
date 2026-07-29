import { spawn } from 'node:child_process'


export async function runSilently(program, args) {
	return new Promise((resolve, reject) => {
		const stdout = []
		const stderr = []

		const p = spawn(program, args)
		p.stdout.on('data', chunk => { stdout.push(chunk) })
		p.stderr.on('data', chunk => { stderr.push(chunk) })

		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve({
					stdout: Buffer.concat(stdout).toString(),
					stderr: Buffer.concat(stderr).toString(),
				})
			else
				reject(new Error(`${program} failed with code ${code}\n${Buffer.concat(stderr).toString()}`))
		})
	})
}


export async function run(program, args) {
	return new Promise((resolve, reject) => {
		const p = spawn(program, args, { stdio: ['inherit', 'pipe', 'pipe'] })
		p.stdout.pipe(process.stdout)
		p.stderr.pipe(process.stderr)
		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve()
			else
				reject(new Error(`${program} failed with code ${code}`))
		})
	})
}

