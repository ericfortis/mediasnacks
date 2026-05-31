#!/usr/bin/env node

import { join } from 'node:path'
import { rename } from 'node:fs/promises'

import { ffmpeg, assertUserHasFFmpeg } from './utils/subprocess.js'
import { lstat, uniqueFilenameFor } from './utils/fs-utils.js'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks sqcrop [-y | --overwrite] [--outdir=<dir>] <images> 

DESCRIPTION
  Square crops images
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		outdir: { type: 'string', default: '' },
		overwrite: { short: 'y', type: 'boolean' },
		help: { short: 'h', type: 'boolean' },
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	if (!files.length)
		throw new Error('No images specified. See mediasnacks sqcrop --help')

	console.log('Cropping…')
	for (const file of files)
		await sqcrop({
			file,
			outFile: join(values.outdir, file),
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
