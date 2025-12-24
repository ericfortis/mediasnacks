#!/usr/bin/env node

import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { replaceExt, lstat, globAll } from './utils/fs-utils.js'
import { ffmpeg, assertUserHasFFmpeg } from './utils/ffmpeg.js'


const USAGE = `
Usage: npx mediasnacks avif [-y | --overwrite] [--output-dir=<dir>] <images> 

Converts images to AVIF.
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, positionals } = parseArgs({
		options: {
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

	if (!positionals.length)
		throw new Error('No images specified. See npx mediasnacks avif --help')

	console.log('AVIF…')
	for (const file of await globAll(positionals))
		await toAvif({
			file,
			outFile: join(values['output-dir'], replaceExt(file, 'avif')),
			overwrite: values.overwrite
		})
}

async function toAvif({ file, outFile, overwrite }) {
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
