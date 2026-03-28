#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { readdirSync } from 'node:fs'


const USAGE = `
Usage: mediasnacks seqcheck [options] [folder]

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
			help: { short: 'h', type: 'boolean' },
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


if (import.meta.main)
	main()
