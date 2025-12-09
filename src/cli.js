#!/usr/bin/env node

import { join } from 'node:path'
import { spawn } from 'node:child_process'
import pkgJSON from '../package.json' with { type: 'json' }


const COMMANDS = {
	avif: ['avif.js', 'Converts images to AVIF'],
	resize: ['resize.js', 'Resizes videos or images'],
	moov2front: ['moov2front.js', 'Rearranges .mov and .mp4 metadata for fast-start streaming'],

	dropdups: ['dropdups.js', 'Removes duplicate frames in a video'],
	seqcheck: ['seqcheck.js', 'Finds missing sequence number'],
	qdir: ['qdir.js', 'Sequentially runs all *.sh files in a folder'],
	hev1tohvc1: ['hev1tohvc1.js', 'Fixes video thumbnails not rendering in macOS Finder '],

	framediff: ['framediff.sh', 'Plays a video of adjacent frames diff'],
	videodiff: ['videodiff.sh', 'Plays a video with the difference of two videos'],
}

const USAGE = `
Usage: npx mediasnacks <command> <args>

Commands:
${Object.entries(COMMANDS).map(([cmd, [,title]]) =>
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
	console.error(`'${opt}' is not a mediasnacks command. See npx mediasnacks --help\n`)
	process.exit(1)
}

const cmd = join(import.meta.dirname, COMMANDS[opt][0])
const executable = cmd.endsWith('.sh')
	? 'sh'
	: process.execPath
spawn(executable, [cmd, ...args], { stdio: 'inherit' })
	.on('exit', code => process.exit(code))
