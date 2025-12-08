import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'
import { resolve, parse, format } from 'node:path'

import { glob } from './utils/fs-utils.js'
import { ffmpeg, assertUserHasFFmpeg, run } from './utils/ffmpeg.js'


const PRORES_PROFILES = {
	'proxy': 0,
	'lt': 1,
	'standard': 2,
	'hq': 3,
	'4444': 4,
	'4444xq': 5,
}

const USAGE = `
Usage: npx mediasnacks dropdups [-n <bad-frame-number>] <video>

Removes duplicate frames and outputs ProRes 422 HQ.

Options:
  -n, --bad-frame-number <n>  Known frame interval to drop.
           Example A: Use n=2 when every other frame is repeated.
		       Example B: Use n=6 if e.g., a 25 fps got upped to 30 fps without interpolation.
  -h, --help
`.trim()


async function main() {
	const { values, positionals } = parseArgs({
		options: {
			'bad-frame-number': { short: 'n', type: 'string' },
			help: { short: 'h', type: 'boolean', default: false },
		},
		allowPositionals: true
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	if (!positionals.length)
		throw new Error('No video specified. See npx mediasnacks dropdups --help')

	let nBadFrame = null
	if (values['bad-frame-number'] !== null) {
		const n = Number(values['bad-frame-number'])
		if (!Number.isFinite(n) || n <= 0)
			throw new Error('Invalid --bad-frame-number. It must be a positive integer.')
		nBadFrame = n
	}

	await assertUserHasFFmpeg()

	console.log('Dropping Duplicate Frames…')
	for (const g of positionals)
		for (const file of await glob(g))
			await drop(resolve(file), nBadFrame)
}

async function drop(video, nBadFrame) {
	await run('ffmpeg', [
		'-v', 'error',
		'-stats',
		'-an',
		'-i', video,
		'-vf', nBadFrame
			? `decimate=cycle=${nBadFrame}`
			: 'mpdecimate,setpts=N/FRAME_RATE/TB',
		'-fps_mode', 'cfr',
		'-c:v', 'prores_ks',
		'-profile:v', PRORES_PROFILES['hq'],
		'-pix_fmt', 'yuv422p10le',
		makeOutputPath(video)
	])
}

function makeOutputPath(video) {
	const abs = resolve(video)
	const { dir, name, ext } = parse(abs)
	return ext.toLowerCase() === '.mov'
		? format({ dir, name: `${name}.dedup`, ext: '.mov' })
		: format({ dir, name, ext: '.mov' })
}

main().catch(err => {
	console.error(err.message || err)
	process.exit(1)
})
