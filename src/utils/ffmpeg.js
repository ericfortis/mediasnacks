import { spawn } from 'node:child_process'


export async function ffmpeg(args) {
	return runSilently('ffmpeg', args)
}

export async function assertUserHasFFmpeg() {
	try {
		await runSilently('ffmpeg', ['-version'])
		await runSilently('ffprobe', ['-version'])
	}
	catch {
		throw new Error('ffmpeg not found. Please install ffmpeg.')
	}
}

/**
 * @template {readonly string[]} K
 * @param {string} video
 * @param {K} props
 * @returns {Promise<{ [P in K[number]]: any }>}
 */
export async function videoAttrs(v, ...props) {
	const { stdout } = await runSilently('ffprobe', [
		'-v', 'error',
		'-select_streams', 'v:0',
		'-show_entries', `stream=${props.join(',')}`,
		'-of', 'json',
		v
	])
	return JSON.parse(stdout).streams[0]
}


async function runSilently(program, args) {
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
		const p = spawn(program, args)
		p.stdout.on('data', data => process.stdout.write(data))
		p.stderr.on('data', chunk => process.stderr.write(chunk))

		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve()
			else
				reject(new Error(`${program} failed with code ${code}`))
		})
	})
}


