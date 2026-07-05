import { parse } from 'node:path'
import { readFileSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks base64 [--css | --img] img

DESCRIPTION
  Encodes image to data URI
  
EXAMPLES
  mediasnacks base64 img
  mediasnacks base64 --img img
  mediasnacks base64 --css img
`

const MIMES = {
	avif: 'image/avif',
	gif: 'image/gif',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	webp: 'image/webp',
}

export default async function main() {
	const { values, files } = await parseOptions(HELP, {
		css: { type: 'boolean' },
		img: { type: 'boolean' },
	})

	if (files.length !== 1)
		throw 'Only one file is accepted'

	const { data, mime } = await base64(files[0])

	if (values.css)
		console.log(`background-image: url(data:${mime};base64,${data})`)
	else if (values.img)
		console.log(`<img src="data:${mime};base64,${data}" />`)
	else
		console.log(data)
}

export async function base64(file) {
	return {
		data: readFileSync(file).toString('base64'),
		mime: MIMES[parse(file).ext.toLowerCase().replace('.', '')] || 'application/octect'
	}
}
