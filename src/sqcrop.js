#!/usr/bin/env node

import { join } from 'node:path'

import { rename } from 'node:fs/promises'
import { ffmpeg, assertUserHasFFmpeg } from './utils/ffmpeg.js'
import { replaceExt, lstat, parseArgsWithGlobs, uniqueFilenameFor } from './utils/fs-utils.js'


const USAGE = `
Usage: npx mediasnacks sqcrop [-y | --overwrite] [--output-dir=<dir>] <images> 

Square crops images
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseArgsWithGlobs({
		options: {
			'output-dir': { type: 'string', default: '' },
			overwrite: { short: 'y', type: 'boolean', default: false },
			help: { short: 'h', type: 'boolean', default: false },
		}
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	if (!files.length)
		throw new Error('No images specified. See npx mediasnacks sqcrop --help')

	console.log('Cropping…')
	for (const file of files)
		await sqcrop({
			file,
			outFile: join(values['output-dir'], file),
			overwrite: values.overwrite
		})
}

async function sqcrop({ file, outFile, overwrite }) {
	const stOut = lstat(outFile)

	if (!overwrite && stOut?.isFile()) {
		console.log('(skipped: output file exists but --overwrite=false)', file)
		return
	}
	if (stOut?.mtimeMs > lstat(file)?.mtimeMs) {
		console.log('(skipped: outputFile is newer)', file)
		return
	}

	console.log(file)
	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-v', 'error',
		'-y',
		'-i', file,
		'-vf', `crop='min(iw,ih)':'min(iw,ih)'`,
		tmp
	])
	await rename(tmp, outFile)
}

main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
