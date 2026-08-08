import { parseOptions } from './utils/parseOptions.js'
import { videoAttrs } from './utils/videoAttrs.js'
import { formatSeconds, cleanDecimals } from './utils/formatSeconds.js'


const HELP = `
SYNOPSIS
  mediasnacks info [-a | --all] <files>

DESCRIPTION
  Prints video attributes.

OPTIONS
  -a, --all    Prints all attributes as JSON

EXAMPLES
  This command prints an output similar to ls, but with the 
  width, height, fps, duration, and codec:
    mediasnacks info *.mp4
  
  Sort by fps:
    mediasnacks info *.* | sort -k3,3n
`

export default async function main() {
	const { values, files, usage } = await parseOptions(HELP, {
		all: { short: 'a', type: 'boolean' }
	})

	if (!files[0]) throw usage('No video file specified')

	for (const video of files)
		if (values.all)
			console.log(JSON.stringify(await videoAttrs(video), '', 2))
		else
			console.log(await infoSummary(video), video)
}


export async function infoSummary(video) {
	const v = await videoAttrs(video)
	return [
		String(v.width).padStart(4),
		String(v.height).padStart(4),
		`${fps(v.r_frame_rate)}fps`.padStart(10),
		formatSeconds(v.duration).padStart(10),
		prettyCodecName(v.codec_name).padEnd(12)
	].join('  ')
}

function fps(rFrameRate) {
	const [num, den] = rFrameRate.split('/').map(Number)
	return cleanDecimals((num / den).toFixed(2))
}

function prettyCodecName(codec) {
	// ffmpeg -codecs | grep '^...V'
	return {
		'dnxhd': 'DNxHD',
		'dvvideo': 'DV (Digital Video)',
		'h264': 'H.264',
		'hevc': 'H.265',
		'jpeg2000': 'JPEG 2000',
		'mpeg4': 'MPEG-4 Part 2',
		'prores': 'ProRes',
		'qtrle': 'QuickTime RLE',
		'rawvideo': 'Uncompressed',
	}[codec] || codec
}



