import { promisify, parseArgs, styleText } from 'node:util'
import { glob as _glob } from 'node:fs'

const glob = promisify(_glob)


/**
 * @param {string} helpText
 * @param {import('node:util').ParseArgsOptionsConfig} [options]
 * @param {Partial<import('node:util').ParseArgsConfig>} [config]
 */
export async function parseOptions(helpText, options = {}, config = {}) {
	options.help = { short: 'h', type: 'boolean' }

	const { values, positionals } = parseArgs({
		args: process.argv.slice(3),
		allowPositionals: true,
		options,
		...config
	})

	if (values.help) {
		console.log(helpText.trim())
		process.exit(0)
	}

	return {
		values,
		positionals,
		files: await resolveGlobs(positionals),
		usage: err => err
			? styleText('redBright', '' + err + '\n') + helpText
			: helpText
	}
}

async function resolveGlobs(arr) {
	const set = new Set()
	for (const arg of arr) {
		const matches = await glob(arg)
		if (matches.length)
			for (const file of matches)
				set.add(file)
		else
			set.add(arg)
	}
	return Array.from(set)
}

