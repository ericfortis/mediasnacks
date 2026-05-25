#!/usr/bin/env node
import { ffmpeg } from './utils/subprocess.js'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks ssim <img1> <img2>

DESCRIPTION
  Computes the Structural Similarity Index (SSIM) between two images using FFmpeg.
`.trim()


async function main() {
	const { values, positionals } = await parseOptions({
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	if (positionals.length !== 2)
		throw new Error('Expected two images')

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
		throw new Error(`Could not parse SSIM output:\n${stderr}`)
	return parseFloat(match[1])
}


if (import.meta.main)
	main().catch(err => {
		console.error(err.message)
		process.exit(1)
	})
