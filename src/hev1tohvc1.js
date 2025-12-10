#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { unlink, rename } from 'node:fs/promises'

import { glob, uniqueFilenameFor } from './utils/fs-utils.js'
import { videoAttrs, ffmpeg, assertUserHasFFmpeg } from './utils/ffmpeg.js'


const USAGE = `
Usage: npx mediasnacks hev1tohvc1 <videos>

This program fixes video thumbnails not rendering in macOS
Finder, and fixes video not importable in Final Cut Pro. That’s done 
by changing the container’s sample entry code from HEV1 to HVC1.
`.trim()


async function main() {
	const { positionals } = parseArgs({ allowPositionals: true })

	if (!positionals.length)
		throw new Error(USAGE)

	await assertUserHasFFmpeg()

	console.log('HEV1 to HVC1…')
	for (const g of positionals)
		for (const file of await glob(g))
			await toHvc1(file)
}

async function toHvc1(file) {
	const v = await videoAttrs(file, 'codec_tag_string')
	if (v.codec_tag_string !== 'hev1') {
		console.log('(skipped: non hev1)', file)
		return
	}

	console.log(file)
	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-i', file,
		'-c', 'copy',
		'-tag:v', 'hvc1',
		tmp
	])
	await unlink(file)
	await rename(tmp, file)
}


main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
