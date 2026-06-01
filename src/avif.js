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


export default async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions(HELP, {
		outdir: { type: 'string' },
		overwrite: { short: 'y', type: 'boolean' },
	})

	if (!files.length)
		throw 'Invalid input image'

	for (const file of files) {
		await avif({
			file,
			outFile: join(values.outdir || dirname(file), replaceExt(basename(file), 'avif')),
			overwrite: values.overwrite
		})
		console.log(file)
	}
}

export async function avif({ file, outFile, overwrite = false }) {
	const stAvif = lstat(outFile)
	if (!overwrite) {
		if (stAvif?.isFile()) throw `output file exists: ${file}`
		if (stAvif?.mtimeMs > lstat(file)?.mtimeMs) throw `avif is newer: ${file}`
	}

	await ffmpeg([
		'-y',
		'-i', file,
		'-c:v', 'libsvtav1',
		'-svtav1-params', 'avif=1',
		outFile
	])
}
