#!/usr/bin/env node

import { ffmpeg } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks ssim <img1> <img2>

DESCRIPTION
  Computes the Structural Similarity Index (SSIM) between two images using ffmpeg.
`.trim()


async function main() {
	const [img1, img2] = process.argv.slice(2)
	if (!img1 || !img2) {
		console.log(HELP)
		process.exit(1)
	}

	const score = await ssim(img1, img2)
	console.log(score)
}

export async function ssim(img1, img2) {
	const result = await ffmpeg([
		'-i', img1,
		'-i', img2,
		'-filter_complex', 'ssim',
		'-f', 'null', '-'
	])
	const match = result.stderr.match(/All:([\d.]+)/)
	if (!match)
		throw new Error(`Could not parse SSIM output:\n${result.stderr}`)
	return parseFloat(match[1])
}


if (import.meta.main)
	main().catch(err => {
		console.error(err.message)
		process.exit(1)
	})
