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
	queuedir: join(import.meta.dirname, 'queuedir.js'),
}

const USAGE = `
Usage: npx mediasnacks <command> <args>

Commands:
    avif: Converts images to AVIF
    resize: Resizes videos or images
    moov2front: Rearranges .mov and .mp4 metadata for fast-start streaming
    
    dropdups: Removes duplicate frames in a video
    seqcheck: Finds missing sequence number
    queuedir: Sequentially runs all *.sh files in a folder
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

spawn(process.execPath, [COMMANDS[opt], ...args], { stdio: 'inherit' })
	.on('exit', code => process.exit(code))
