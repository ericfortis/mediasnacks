#!/usr/bin/env node

import { resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'


const USAGE = `
Usage: npx mediasnacks seqcheck [options] [folder]

Find missing numbered files in a sequence.

Options:
  -ld, --left-delimiter <str>   Delimiter before the number (default: "_")
  -rd, --right-delimiter <str>  Delimiter after the number (default: ".")
  -h,  --help
`.trim()


function main() {
	const { values, positionals } = parseArgs({
		options: {
			'left-delimiter': { type: 'string', default: '_' },
			'right-delimiter': { type: 'string', default: '.' },
			help: { short: 'h', type: 'boolean', default: false },
		},
		allowPositionals: true,
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	const seq = extractSeqNums(
		readdirSync(positionals[0] || process.cwd()),
		values['left-delimiter'],
		values['right-delimiter'])

	const missing = findMissingNumbers(seq)
	if (missing.length)
		console.log('Missing:', missing)
}

export function extractSeqNums(names, leftDelimiter, rightDelimiter) {
	const pattern = new RegExp(escapeRegex(leftDelimiter) + '(\\d+)' + escapeRegex(rightDelimiter))
	const seq = []
	for (const name of names) {
		const match = name.match(pattern)
		if (match)
			seq.push(Number(match[1]))
	}
	return seq.sort()
}

export function findMissingNumbers(seq) {
	if (seq.length < 2)
		return []
	const missing = []
	for (let i = seq[0]; i <= seq[seq.length - 1]; i++)
		if (!seq.includes(i))
			missing.push(i)
	return missing
}

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


if (fileURLToPath(import.meta.url) === process.argv[1])
	main()
