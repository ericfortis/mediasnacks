import { promisify, parseArgs } from 'node:util'
import { glob as _glob } from 'node:fs'


const glob = promisify(_glob)

export async function parseOptions(helpText = '', options = {}, config = {}) {
	if (helpText)
		options.help = { short: 'h', type: 'boolean' }

	const { values, positionals, tokens } = parseArgs({
		args: process.argv.slice(3),
		allowPositionals: true,
		options,
		...config,
		tokens: true
	})

	if (values.help) {
		console.log(helpText)
		process.exit(0)
	}

	return {
		values,
		positionals,
		files: await resolveGlobs(positionals, tokens)
	}
}

async function resolveGlobs(arr, tokens = []) {
	const terminatorIndex = tokens.find(t => t.kind === 'option-terminator')?.index ?? -1
	const set = new Set()

	const globable = terminatorIndex === -1
		? arr
		: arr.slice(0, terminatorIndex)

	for (const g of globable)
		for (const file of await glob(g))
			set.add(file)


	if (terminatorIndex !== -1)
		for (const literal of arr.slice(terminatorIndex))
			set.add(literal)

	return Array.from(set)
}

