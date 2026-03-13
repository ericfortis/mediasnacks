#!/usr/bin/env node

import { basename, extname, join, parse } from 'node:path'

import { mkDir } from './utils/fs-utils.js'
import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg, videoAttrs, assertUserHasFFmpeg } from './utils/ffmpeg.js'


const USAGE = `
Usage: npx mediasnacks edgespic [--width=<num>] <files>

Extracts the first and last frames from each video and saves them to the 'edgepics/' subfolder.
--width defaults to 640px and The aspect ratio is preserved.

Example:
    npx mediasnacks edgespic --width 800 *.mov
    npx mediasnacks edgespic -w 600 'videos/**/*.mp4'
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		'width': { short: 'w', type: 'string', default: '640' },
		help: { short: 'h', type: 'boolean' },
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	const width = Number(values['width'])
	if (width <= 0 || !Number.isInteger(width))
		throw new Error('--width must be a positive number')

	if (!files.length)
		throw new Error('No video files specified')

	const outDir = join(parse(files[0]).dir, 'edgespics')
	await mkDir(outDir) 

	console.log('Extracting edge frames…')
	for (const file of files)
		await extractEdgeFrames(file, width, outDir)
}


async function extractEdgeFrames(video, width, outDir) {
	const { r_frame_rate } = await videoAttrs(video)
	const name = basename(video, extname(video))

	await ffmpeg([
		'-i', video,
		'-vf', `scale=${width}:-1`,
		'-frames:v', '1',
		join(outDir, `${name}_first.png`)
	])

	await ffmpeg([
		'-sseof', `-${1 / eval(r_frame_rate)}`,
		'-i', video,
		'-vf', `scale=${width}:-1`,
		'-frames:v', '1',
		join(outDir, `${name}_last.png`)
	])
}


main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
