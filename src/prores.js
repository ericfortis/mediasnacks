#!/usr/bin/env node

import { resolve, parse, join } from 'node:path'

import { parseOptions } from './utils/parseOptions.js'
import { assertUserHasFFmpeg, run } from './utils/ffmpeg.js'

const PRORES_PROFILES = {
	'proxy': 0,
	'lt': 1,
	'standard': 2,
	'hq': 3,
	'4444': 4,
	'4444xq': 5,
}

const MAN = `
SYNOPSIS
  mediasnacks prores [options] <video>

DESCRIPTION
  Converts a video to ProRes format.

OPTIONS
  -p, --profile <n>  ProRes profile (default: 3 (422 HQ))
  -h, --help         Show this help message

EXAMPLES
  mediasnacks prores video.mov
  mediasnacks prores --profile 2 video.mov

  Both output a file named: video.prores.mov
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		help: { short: 'h', type: 'boolean' },
		profile: { short: 'p', type: 'string', default: String(PRORES_PROFILES.hq) },
	})

	if (values.help) {
		console.log(MAN)
		process.exit(0)
	}

	if (files.length !== 1)
		throw new Error('Expected 1 argument: video file. See mediasnacks prores --help')

	const videoPath = resolve(files[0])

	const { name, dir } = parse(videoPath)
	const outputPath = join(dir, `${name}.prores.mov`)

	console.log(`Converting to ProRes…`)
	await run('ffmpeg', [
		'-v', 'error',
		'-stats',
		'-i', videoPath,
		'-c:v', 'prores_ks',
		'-profile:v', values.profile,
		'-pix_fmt', 'yuv422p10le',
		outputPath
	])
}

main().catch(err => {
	console.error(err.message || err)
	process.exit(1)
})
