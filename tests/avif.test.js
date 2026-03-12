import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'

import { sha1 } from './utils.js'


test('PNG to AVIF', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'avif-test-'))
	execSync(`src/cli.js avif --output-dir ${tmp} tests/fixtures/lenna.png` )
	equal(sha1(join(tmp, 'lenna.avif')), sha1('tests/fixtures/lenna.avif'))
})
