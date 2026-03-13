#!/usr/bin/env node

import { join } from 'node:path'
import { spawn } from 'node:child_process'
import pkgJSON from '../package.json' with { type: 'json' }


const COMMANDS = {
	avif: ['avif.js', 'Converts images to AVIF'],
	sqcrop: ['sqcrop.js', 'Square crops images'],

	dropdups: ['dropdups.js', 'Removes duplicate frames in a video'],
	framediff: ['framediff.sh', 'Plays a video of adjacent frames diff'],
	gif: ['gif.sh', 'Video to GIF'],
	hev1tohvc1: ['hev1tohvc1.js', 'Fixes video thumbnails not rendering in macOS Finder '],
	moov2front: ['moov2front.js', 'Rearranges .mov and .mp4 metadata for fast-start streaming'],
	resize: ['resize.js', 'Resizes videos or images'],
	vconcat: ['vconcat.sh', 'Concatenates videos'],
	vdiff: ['vdiff.sh', 'Plays a video with the difference of two videos'],
	vsplit: ['vsplit.js', 'Splits a video into multiple clips from CSV timestamps'],
	vtrim: ['vtrim.sh', 'Trims video from start to end time'],

	flattendir: ['flattendir.sh', 'Moves all files to top dir and deletes dirs'],
	qdir: ['qdir.js', 'Sequentially runs all *.sh files in a folder'],
	seqcheck: ['seqcheck.js', 'Finds missing sequence number'],

	dlaudio: ['dlaudio.sh', 'yt-dlp best audio'],
	dlvideo: ['dlvideo.sh', 'yt-dlp best video'],

	unemoji: ['unemoji.sh', 'Removes emojis from filenames'],
	rmcover: ['rmcover.sh', 'Removes cover art'],

	curltime: ['curltime.sh', 'Measures request response timings'],
}

const USAGE = `
Usage: npx mediasnacks <command> <args>

Commands:
${Object.entries(COMMANDS).map(([cmd, [, title]]) =>
	`    ${cmd}\t${title}`).join('\n')}
`.trim()


const [, , opt, ...args] = process.argv

if (opt === '-v' || opt === '--version') {
	console.log(pkgJSON.version)
	process.exit(0)
}
if (opt === '-h' || opt === '--help') {
	console.log(USAGE)
	process.exit(0)
}

if (!opt) {
	console.log(USAGE)
	process.exit(1)
}
if (!Object.hasOwn(COMMANDS, opt)) {
	console.error(`'${opt}' is not a command. See npx mediasnacks --help\n`)
	process.exit(1)
}

const cmd = join(import.meta.dirname, COMMANDS[opt][0])
spawn(cmd, args, { stdio: 'inherit' })
	.on('exit', process.exit)
