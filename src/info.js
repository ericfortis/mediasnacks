import { parseOptions } from './utils/parseOptions.js'
import { videoAttrs } from './utils/videoAttrs.js'
import { formatSeconds, cleanDecimals } from './utils/formatSeconds.js'


const HELP = `
SYNOPSIS
  mediasnacks info [-a | --all] <files>

DESCRIPTION
  Prints video or image attributes using ffprobe. By default, it’s similar to 
  \`ls\` but prints the: width, height, fps, duration, codec, and filename.

OPTIONS
  -a, --all    Prints everything as JSON

EXAMPLES
  Short summary of each match:	
    mediasnacks info *.mp4
  
  Sort by fps:
    mediasnacks info *.* | sort -k3,3n

  Move 60fps videos into 60fps/ subdir: 
    FPS=60
    DIR=\${FPS}fps
    mkdir -p \$DIR
    mediasnacks info *.* |
      grep \${FPS}fps |
      awk -F\\t '{print $NF}' |
      while read -r f; do
        mv -- "$f" \$DIR/
      done  
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
			console.log(`${await infoSummary(video)}\t${video}`)
}


export async function infoSummary(video) {
	const v = await videoAttrs(video)
	return [
		String(v.width).padStart(4),
		String(v.height).padStart(4),
		`${fps(v.r_frame_rate)}fps`.padStart(7),
		formatSeconds(v.duration, 0).padStart(8),
		v.codec_name
	].join('\t')
}

function fps(rFrameRate) {
	const [num, den] = rFrameRate.split('/').map(Number)
	return cleanDecimals((num / den).toFixed(2))
}
