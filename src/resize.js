import { join } from 'node:path'
import { rename } from 'node:fs/promises'

import { parseOptions } from './utils/parseOptions.js'
import { isFile, uniqueFilenameFor } from './utils/fs-utils.js'
import { ffmpeg } from './utils/subprocess.js'
import { videoAttrs } from './utils/videoAttrs.js'


const HELP = `
SYNOPSIS
  mediasnacks resize [options] <files>

DESCRIPTION
  Resizes videos and images. The aspect ratio is preserved when only one dimension is specified.

OPTIONS
  --width <num>
  --height <num>
		Only one is needed. They are -2 by default:
			-1 = auto-compute while preserving the aspect ratio (may result in an odd number)
			-2 = same as -1 but rounds to the nearest even number
	--outdir <dir>  Defaults to same dir of input file
	-y, --overwrite
		
EXAMPLES
  Overwrites the input file (-y)
    mediasnacks resize -y --width 480 'dir-a/**/*.png' 'dir-b/**/*.mp4'

  Output directory
    mediasnacks resize --height 240 --outdir /tmp/out video.mov
`

export default async function main() {
	const { values, files, usage } = await parseOptions(HELP, {
		width: { type: 'string', default: '-2' },
		height: { type: 'string', default: '-2' },
		outdir: { type: 'string', default: '' },
		overwrite: { short: 'y', type: 'boolean' },
	})

	const width = Number(values.width)
	const height = Number(values.height)

	if (!files.length) throw usage('No video files specified')
	if (width <= 0 && height <= 0) throw usage('--width or --height must be > 0')

	for (const file of files) {
		await resize({
			file,
			outFile: join(values.outdir, file),
			overwrite: values.overwrite,
			width,
			height,
		})
		console.log(file)
	}
}


export async function resize({ file, outFile, overwrite, width, height }) {
	const v = await videoAttrs(file)
	if (width === v.width && height === v.height
		|| width < 0 && height === v.height
		|| height < 0 && width === v.width
	)
		throw `no changes needed. ${file}`

	if (!overwrite && isFile(outFile))
		throw `output file exists but --overwrite=false. ${file}`

	const tmp = uniqueFilenameFor(file)
	await ffmpeg([
		'-i', file,
		'-vf', `scale=${width}:${height}`,
		'-movflags', '+faststart',
		tmp
	])
	await rename(tmp, outFile)
}
