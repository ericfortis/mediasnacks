#!/usr/bin/env node

import { parseArgs } from 'node:util'

import { ffmpeg, assertUserHasFFmpeg } from './utils/ffmpeg.js'
import { uniqueFilenameFor, overwrite, globAll } from './utils/fs-utils.js'


const USAGE = `
Usage: npx mediasnacks moov2front <videos>

Rearranges .mov and .mp4 metadata to the start of the file for fast-start streaming.

Files are overwritten.
`.trim()

async function main() {
	await assertUserHasFFmpeg()

	const { positionals } = parseArgs({ allowPositionals: true })
	if (!positionals.length)
		throw new Error(USAGE)

	console.log('Optimizing video for progressive download…')
	for (const file of await globAll(positionals))
		await moov2front(file)
}

async function moov2front(file) {
	if (!/\.(mp4|mov)$/i.test(file)) {
		console.log('(skipped: not mp4/mov)', file)
		return
	}
	if (await moovIsBeforeMdat(file)) {
		console.log('(skipped: no changes needed)', file)
		return
	}

	console.log(file)
	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-hide_banner',
		'-i', file,
		'-movflags', '+faststart',
		tmp
	])
	await overwrite(tmp, file)
}

async function moovIsBeforeMdat(file) {
	const { stderr } = await ffmpeg([
		'-hide_banner',
		'-v', 'trace',
		'-i', file,
		'-f', 'null', '-'
	])
	const firstMatchedAtom = stderr.match(/type:'(moov|mdat)'/)?.[1]
	return firstMatchedAtom === 'moov'
}


main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
