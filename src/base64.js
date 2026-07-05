import { parse } from 'node:path'
import { readFileSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks base64 [--css | --img] img

DESCRIPTION
  Encodes image to data URI
 
OPTIONS
  --css	Outputs CSS background-image
  --img	Outputs HTML img tag with encoded src
  
EXAMPLES
  mediasnacks base64 img
  mediasnacks base64 --css img
  mediasnacks base64 --img img
`

const mimes = new class {
	#MIMES = {
		apng: 'image/apng',
		avif: 'image/avif',
		bmp: 'image/bmp',
		gif: 'image/gif',
		heic: 'image/heic',
		heif: 'image/heif',
		ico: 'image/vnd.microsoft.icon',
		jpeg: 'image/jpeg',
		jpg: 'image/jpeg',
		jxl: 'image/jxl',
		png: 'image/png',
		svg: 'image/svg+xml',
		tga: 'image/x-targa',
		tif: 'image/tiff',
		webp: 'image/webp',
	}
	mimeFor(file) {
		return this.#MIMES[parse(file).ext.toLowerCase().replace('.', '')] || 'application/octect'
	}
}


export default async function main() {
	const { values, files } = await parseOptions(HELP, {
		css: { type: 'boolean' },
		img: { type: 'boolean' },
	})

	if (files.length === 0) throw 'Missing or invalid file'
	if (files.length !== 1) throw 'Only one file is accepted'

	const { data, mime } = base64(files[0])
	if (values.css) console.log(`background-image: url(data:${mime};base64,${data});`)
	else if (values.img) console.log(`<img src="data:${mime};base64,${data}" />`)
	else console.log(data)
}

export function base64(file) {
	return {
		data: readFileSync(file).toString('base64'),
		mime: mimes.mimeFor(file)
	}
}
