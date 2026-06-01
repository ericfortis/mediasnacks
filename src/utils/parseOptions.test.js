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

	test('parses args and globs files', async () => {
		const { values, positionals, files } = await parseOptions('HELP', {
			outdir: { type: 'string' }
		}, {
			args: ['--outdir', '/tmp', inTmpDir('file[12].png')],
		})
		equal(values.outdir, '/tmp')
		deepEqual(positionals, [inTmpDir('file[12].png')])
		deepEqual(files, [
			inTmpDir('file1.png'),
			inTmpDir('file2.png')
		])
	})

	test('respects verbatim tokens', async () => {
		const literal0 = 'literal-file[98].png'
		const literal1 = 'literal-file[99].png'
		const { files } = await parseOptions('HELP', {}, {
			args: [inTmpDir('file[12].png'), '--', literal0, literal1]
		})
		deepEqual(files, [
			inTmpDir('file1.png'),
			inTmpDir('file2.png'),
			literal0,
			literal1,
		])
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
})
