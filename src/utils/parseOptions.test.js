import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { equal, deepEqual } from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { test, describe, before, after } from 'node:test'

import { parseOptions } from './parseOptions.js'


describe('parseOptions', () => {
	let testDir
	let inTmpDir = f => join(testDir, f)
	const testFiles = ['file1.png', 'file2.png', 'file3.png']

	before(async () => {
		testDir = await mkdtemp(join(tmpdir(), 'parse-args-'))
		for (const file of testFiles)
			await writeFile(inTmpDir(file), '')
	})

	after(() => rm(testDir, { recursive: true }))

	test('globs pattern positionals and keeps verbatim literals', async () => {
		const { values, positionals, files } = await parseOptions('HELP', {
			outdir: { type: 'string', default: '' }
		}, {
			args: ['--outdir', '/tmp', inTmpDir('file[12].png'), inTmpDir('file4[special].png')],
		})
		equal(values.outdir, '/tmp')
		deepEqual(positionals, [inTmpDir('file[12].png'), inTmpDir('file4[special].png')])
		deepEqual(files, [
			inTmpDir('file1.png'),
			inTmpDir('file2.png'),
			inTmpDir('file4[special].png')
		])
	})

	test('falls back to the literal when the glob matches nothing', async () => {
		const { files } = await parseOptions('HELP', {}, {
			args: [inTmpDir('nonexistent[1].png')],
		})
		deepEqual(files, [inTmpDir('nonexistent[1].png')])
	})

	test('empty files array when no positionals', async () => {
		const { files, values } = await parseOptions('HELP', {
			foo: { type: 'boolean' }
		}, {
			args: ['--foo'],
		})
		equal(values.foo, true)
		deepEqual(files, [])
	})

	test('prints help and exits when --help is provided', async () => {
		const originalExit = process.exit
		const originalLog = console.log
		let exitCode
		let loggedText
		process.exit = code => { exitCode = code }
		console.log = text => { loggedText = text }
		await parseOptions('HELP TEXT', {}, { args: ['--help'], })
		process.exit = originalExit
		console.log = originalLog
		equal(exitCode, 0)
		equal(loggedText, 'HELP TEXT')
	})
})
