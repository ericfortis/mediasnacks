#!/usr/bin/env node
import { join, basename, dirname } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { replaceExt, lstat } from './utils/fs-utils.js'
import { ffmpeg, assertUserHasFFmpeg } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks avif [-y | --overwrite] [--outdir=<dir>] <images> 

DESCRIPTION
 Converts images to AVIF.

EXAMPLES
  mediasnacks avif -y '*.png'
  mediasnacks avif --outdir=foo/ 'a/**/*.png'
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
		throw new Error('No images specified. See mediasnacks avif --help')

	console.log('AVIF…')
	for (const file of files)
		await avif({
			file,
			outFile: join(values.outdir || dirname(file), replaceExt(basename(file), 'avif')),
			overwrite: values.overwrite
		})
}

async function avif({ file, outFile, overwrite }) {
	const stAvif = lstat(outFile)

	if (!overwrite && stAvif?.isFile()) {
		console.log('(skipped: output file exists but --overwrite=false)', file)
		return
	}
	if (stAvif?.mtimeMs > lstat(file)?.mtimeMs) {
		console.log('(skipped: avif is newer)', file)
		return
	}

	// TODO fix transparent PNGs
	console.log(file)
	await ffmpeg([
		'-y',
		'-i', file,
		'-c:v', 'libsvtav1',
		'-svtav1-params', 'avif=1',
		outFile
	])
}

main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
