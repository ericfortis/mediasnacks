#!/usr/bin/env node

import { join } from 'node:path'
import { spawn } from 'node:child_process'
import pkgJSON from '../package.json' with { type: 'json' }


const COMMANDS = {
	avif: join(import.meta.dirname, 'avif.js'),
	resize: join(import.meta.dirname, 'resize.js'),
	moov2front: join(import.meta.dirname, 'moov2front.js'),
	
	dropdups: join(import.meta.dirname, 'dropdups.js'),
	seqcheck: join(import.meta.dirname, 'seqcheck.js'),
	qdir: join(import.meta.dirname, 'qdir.js'),
	hev1tohvc1: join(import.meta.dirname, 'hev1tohvc1.js'),
	
	framediff: join(import.meta.dirname, 'framediff.sh'),
	videodiff: join(import.meta.dirname, 'videodiff.sh'),
}

const USAGE = `
Usage: npx mediasnacks <command> <args>

Commands:
    avif: Converts images to AVIF
    resize: Resizes videos or images
    moov2front: Rearranges .mov and .mp4 metadata for fast-start streaming
    
    dropdups: Removes duplicate frames in a video
    seqcheck: Finds missing sequence number
    qdir: Sequentially runs all *.sh files in a folder
    hev1tohvc1: Fixes video thumbnails not rendering in macOS Finder 
    
    framediff: Plays a video of adjacent frames diff
    videodiff: Plays a video with the difference of two videos
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

const cmd = COMMANDS[opt]
const executable = cmd.endsWith('.sh') 
	? 'sh' 
	: process.execPath
spawn(executable, [cmd, ...args], { stdio: 'inherit' })
	.on('exit', code => process.exit(code))
