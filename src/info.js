import { parseOptions } from './utils/parseOptions.js'
import { videoAttrs } from './utils/videoAttrs.js'
import { formatSeconds, cleanDecimals } from './utils/formatSeconds.js'


const HELP = `
SYNOPSIS
  mediasnacks info [-a | --all] <file>

DESCRIPTION
  Prints all available attributes for the primary video stream from ffprobe.

OPTIONS
  -a, --all    Prints all attributes as JSON
`

export default async function main() {
	const { values, files, usage } = await parseOptions(HELP, {
		all: { short: 'a', type: 'boolean' }
	})

	const video = files[0]
	if (!video) throw usage('No video file specified')

	if (values.all)
		console.log(JSON.stringify(await videoAttrs(video), '', 2))
	else
		console.log(await infoSummary(video))
}


export async function infoSummary(video) {
	const v = await videoAttrs(video)
	return [
		`${v.width}×${v.height}`,
		`${fps(v.r_frame_rate)}fps`,
		formatSeconds(v.duration),
		prettyCodecName(v.codec_name)
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



