import { readFileSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'
import { mimeFor } from './utils/mimeFor.js'

const HELP = `
SYNOPSIS
  mediasnacks base64 [--css | --img] file

DESCRIPTION
  Encodes a file to data URI.
  
EXAMPLES
  mediasnacks base64 file
  mediasnacks base64 --img file
  mediasnacks base64 --css file
`

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

export async function base64(filePath) {
	return {
		data: readFileSync(filePath).toString('base64'),
		mime: await mimeFor(filePath)
	}
}
