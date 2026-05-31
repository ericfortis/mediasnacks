#!/usr/bin/env node

import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { styleText } from 'node:util'
import pkgJSON from '../package.json' with { type: 'json' }


const COMMANDS = {
	avif: ['./avif.js', 'Converts images to AVIF'],
	png: ['./png.js', 'Optimizes PNG images with oxipng'],
	sqcrop: ['./sqcrop.js', 'Square crops images\n'],

	resize: ['./resize.js', 'Resizes videos or images'],
	edgespic: ['./edgespic.js', 'Extracts first and last frames'],
	frameseq: ['./frameseq.js', 'Converts video to sequence of PNGs'],
	countframes: ['./countframes.js', 'Counts frames in a video'],
	ssim: ['./ssim.js', 'Computes SSIM between two images'],
	gif: ['./gif.sh', 'Video to GIF\n'],

	detectdups: ['./detectdups.js', 'Detects duplicate frames in a video'],
	dropdups: ['./dropdups.js', 'Removes duplicate frames in a video'],
	framediff: ['./framediff.sh', 'Plays a video of adjacent frames diff'],
	hev1tohvc1: ['./hev1tohvc1.js', 'Fixes video thumbnails not rendering on macOS Finder'],
	moov2front: ['./moov2front.js', 'Rearranges .mov and .mp4 metadata for fast-start streaming'],
	vconcat: ['./vconcat.sh', 'Concatenates videos'],
	vdiff: ['./vdiff.sh', 'Plays a video with the difference of two videos'],
	vsplit: ['./vsplit.js', 'Splits a video into multiple clips from CSV timestamps'],
	vtrim: ['./vtrim.js', 'Trims video from start to end time'],
	prores: ['./prores.js', 'Converts video to ProRes\n'],

	flattendir: ['./flattendir.sh', 'Moves all files to top dir and deletes dirs'],
	qdir: ['./qdir.js', 'Sequentially runs all *.sh files in a folder'],
	seqcheck: ['./seqcheck.js', 'Finds missing sequence number'],
	openrand: ['./openrand.js', 'Opens a random file (macOS only)'],
	play: ['./play.js', 'Plays filtered playlist with mpv\n'],

	dlaudio: ['./dlaudio.js', 'yt-dlp best audio'],
	dlvideo: ['./dlvideo.js', 'yt-dlp best video\n'],

	unemoji: ['./unemoji.js', 'Removes emojis from filenames'],
	rmcover: ['./rmcover.sh', 'Removes cover art'],
}

export function commandsSummary() {
	return Object.entries(COMMANDS)
		.map(([cmd, [, desc]]) => [cmd, desc])
}

const HELP = `
SYNOPSIS
  mediasnacks <command> <args>

COMMANDS
${commandsSummary().map(([cmd, desc]) =>
	`  ${styleText('bold', cmd.padEnd(12, ' '))}\t${desc}`).join('\n')}
`.trim()


async function main() {
	const [, , opt, ...args] = process.argv

	if (opt === '-v' || opt === '--version') {
		console.log(pkgJSON.version)
		return
	}
	if (opt === '-h' || opt === '--help') {
		console.log(HELP)
		return
	}

	if (!opt) {
		console.log(HELP)
		process.exit(1)
	}
	if (!Object.hasOwn(COMMANDS, opt)) {
		console.error(`'${opt}' is not a command. See mediasnacks --help\n`)
		process.exit(1)
	}

	const cmd = COMMANDS[opt][0]
	if (cmd.endsWith('.js'))
		(await import(cmd)).default()
	else
		spawn(join(import.meta.dirname, cmd), args, { stdio: 'inherit' })
			.on('exit', process.exit)
}

if (import.meta.main)
	main().catch(err => {
		console.error(err?.message || err)
		process.exit(1)
	})
