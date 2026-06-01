import { ffmpeg, assertUserHasFFmpeg } from './utils/subprocess.js'
import { uniqueFilenameFor, overwrite } from './utils/fs-utils.js'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks moov2front <videos>

DESCRIPTION
  Rearranges .mov and .mp4 metadata to the start of the file for fast-start streaming.
  
  What is Fast Start?
	  - https://wiki.avblocks.com/avblocks-for-cpp/muxer-parameters/mp4
	  - https://trac.ffmpeg.org/wiki/HowToCheckIfFaststartIsEnabledForPlayback
 
NOTES
  Files are overwritten.
`.trim()


export default async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions(HELP)

	if (!files.length)
		throw 'Missing input file(s)'

	for (const file of files) {
		await moov2front(file)
		console.log(file)
	}
}

export async function moov2front(file) {
	if (!/\.(mp4|mov)$/i.test(file)) throw `not mp4/mov. ${file}`
	if (await moovIsBeforeMdat(file)) throw `no changes needed. ${file}`

	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-hide_banner',
		'-i', file,
		'-movflags', '+faststart',
		tmp
	])
	await overwrite(tmp, file)
}

async function moovIsBeforeMdat(file) {
	const { stderr } = await ffmpeg([
		'-hide_banner',
		'-v', 'trace',
		'-i', file,
		'-f', 'null', '-'
	])
	const firstMatchedAtom = stderr.match(/type:'(moov|mdat)'/)?.[1]
	return firstMatchedAtom === 'moov'
}
