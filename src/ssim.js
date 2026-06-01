import { ffmpeg } from './utils/subprocess.js'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks ssim <img1> <img2>

DESCRIPTION
  Computes the Structural Similarity Index (SSIM) between two images using FFmpeg.
`.trim()


export default async function main() {
	const { values, positionals } = await parseOptions({
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	if (positionals.length !== 2)
		throw 'Expected two images'

	const score = await ssim(...positionals)
	console.log(score.toString())
}

export async function ssim(img1, img2) {
	const { stderr } = await ffmpeg([
		'-i', img1,
		'-i', img2,
		'-filter_complex', 'ssim',
		'-f', 'null', '-'
	])
	const match = stderr.match(/All:([\d.]+)/)
	if (!match)
		throw `Could not parse SSIM output:\n${stderr}`
	return parseFloat(match[1])
}
