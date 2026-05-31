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


export default async function main() {
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
		try {
			await sqcrop({
				file,
				outFile: join(values.outdir, file),
				overwrite: values.overwrite
			})
			console.log(file)
		}
		catch (err) {
			console.error(err?.message || err)
		}
}

export async function sqcrop({ file, outFile, overwrite }) {
	const stOut = lstat(outFile)

	if (!overwrite && stOut?.isFile()) throw new Error(`output file exists but --overwrite=false. ${file}`)
	if (stOut?.mtimeMs > lstat(file)?.mtimeMs) throw new Error(`outputFile is newer. ${file}`)

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
