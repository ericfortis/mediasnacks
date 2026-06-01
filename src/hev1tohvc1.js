import { parseOptions } from './utils/parseOptions.js'
import { uniqueFilenameFor, overwrite } from './utils/fs-utils.js'
import { ffmpeg, assertUserHasFFmpeg } from './utils/subprocess.js'
import { videoAttrs } from './utils/videoAttrs.js'


const HELP = `
SYNOPSIS
  mediasnacks hev1tohvc1 <videos>

DESCRIPTION
  This program fixes video thumbnails not rendering in macOS
  Finder, and fixes video not importable in Final Cut Pro. That’s done 
  by changing the container’s sample entry code from HEV1 to HVC1.
`.trim()


export default async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	if (!files.length) throw 'Missing input file(s)'

	for (const file of files) {
		await hev1tohvc1(file)
		console.log(file)
	}
}

export async function hev1tohvc1(file) {
	const v = await videoAttrs(file)
	if (v.codec_tag_string !== 'hev1') throw `non hev1 ${file}`

	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-i', file,
		'-c', 'copy',
		'-tag:v', 'hvc1',
		tmp
	])
	await overwrite(tmp, file)
}
