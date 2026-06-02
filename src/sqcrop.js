import { join } from 'node:path'
import { rename } from 'node:fs/promises'

import { ffmpeg } from './utils/subprocess.js'
import { lstat, uniqueFilenameFor } from './utils/fs-utils.js'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks sqcrop [-y | --overwrite] [--outdir=<dir>] <images> 

DESCRIPTION
  Square crops images
`


export default async function main() {
	const { values, files } = await parseOptions(HELP, {
		outdir: { type: 'string', default: '' },
		overwrite: { short: 'y', type: 'boolean' },
	})

	if (!files.length)
		throw 'No images specified'

	for (const file of files) {
		await sqcrop({
			file,
			outFile: join(values.outdir, file),
			overwrite: values.overwrite
		})
		console.log(file)
	}
}

export async function sqcrop({ file, outFile, overwrite }) {
	const stOut = lstat(outFile)

	if (!overwrite && stOut?.isFile()) throw `output file exists but --overwrite=false. ${file}`
	if (stOut?.mtimeMs > lstat(file)?.mtimeMs) throw `outputFile is newer. ${file}`

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
