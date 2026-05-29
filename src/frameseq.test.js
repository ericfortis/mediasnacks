import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { cpSync, readdirSync } from 'node:fs'

import { cli, mkTempDir } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

describe('frameseq', () => {
	const tmp = mkTempDir('frameseq')
	const inputFile = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), inputFile)

	cli('frameseq', '--start', '0', '--end', '2', inputFile)

	test('creates sequence directory with expected number of files', () => {
		const files = readdirSync(join(tmp, '60fps'))
		ok(files.length === 120, `Expected 120 PNG files (2 seconds * 60fps), got ${files.length}`)
	})
})
