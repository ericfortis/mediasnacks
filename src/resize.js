#!/usr/bin/env node

import { join } from 'node:path'
import { rename } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { glob, isFile, uniqueFilenameFor } from './utils/fs-utils.js'
import { ffmpeg, videoAttrs, assertUserHasFFmpeg } from './utils/ffmpeg.js'



const USAGE = `
Usage: npx mediasnacks resize [--width=<num>] [--height=<num>] [-y | --overwrite] [--output-dir=<dir>] <files>

Resizes videos and images. The aspect ratio is preserved when only one dimension is specified.

Example: Overwrites the input file (-y)
    npx mediasnacks resize -y --width 480 'dir-a/**/*.png' 'dir-b/**/*.mp4'

Example: Output directory (-o)
    npx mediasnacks resize --height 240 --output-dir /tmp/out video.mov
   
Details:
	--width and --height are -2 by default:
		-1 = auto-compute while preserving the aspect ratio (may result in an odd number)
		-2 = same as -1 but rounds to the nearest even number
`.trim()


async function main() {
	const { values, positionals } = parseArgs({
		options: {
			width: { type: 'string', default: '-2' },
			height: { type: 'string', default: '-2' },
			'output-dir': { type: 'string', default: '' },
			overwrite: { short: 'y', type: 'boolean', default: false },
			help: { short: 'h', type: 'boolean', default: false },
		},
		allowPositionals: true
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	const width = Number(values.width)
	const height = Number(values.height)

	if (width <= 0 && height <= 0)
		throw new Error('--width or --height need to be greater than 0')

	if (!positionals.length)
		throw new Error('No video files specified')

	await assertUserHasFFmpeg()

	console.log('Resizing…')
	for (const g of positionals)
		for (const file of await glob(g))
			await resize({
				file,
				outFile: join(values['output-dir'], file),
				overwrite: values.overwrite,
				width,
				height,
			})
}


async function resize({ file, outFile, overwrite, width, height }) {
	const v = await videoAttrs(file, 'width', 'height')
	if (width === v.width && height === v.height
		|| width < 0 && height === v.height
		|| height < 0 && width === v.width) {
		console.log('(skipped: no changes needed)', file)
		return
	}

	if (!overwrite && isFile(outFile)) {
		console.log('(skipped: output file exists but --overwrite=false)', file)
		return
	}

	console.log(file)
	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-i', file,
		'-vf', `scale=${width}:${height}`,
		'-movflags', '+faststart',
		tmp
	])
	await rename(tmp, outFile)
}


main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
