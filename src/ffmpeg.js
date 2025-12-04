import { spawn } from 'node:child_process'


export async function ffmpeg(args) {
	return run('ffmpeg', args)
}

export async function assertUserHasFFmpeg() {
	try {
		await run('ffmpeg', ['-version'])
		await run('ffprobe', ['-version'])
	}
	catch {
		throw new Error('ffmpeg not found. Please install ffmpeg.')
	}
}

export async function videoAttrs(v, ...props) {
	const { stdout } = await run('ffprobe', [
		'-v', 'error',
		'-select_streams', 'v:0',
		'-show_entries', `stream=${props.join(',')}`,
		'-of', 'json',
		v
	])
	return JSON.parse(stdout).streams[0]
}


async function run(program, args) {
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

