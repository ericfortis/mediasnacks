import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync } from 'node:fs'

function sha1(filePath) {
	return createHash('sha1').update(readFileSync(filePath)).digest('hex')
}

test('PNG to AVIF', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'avif-test-'))
	
	execSync(`src/cli.js avif --output-dir ${tmp} tests/fixtures/lenna.png`, {
		cwd: process.cwd(),
		stdio: 'inherit'
	})

	equal(sha1(join(tmp, 'lenna.avif')), sha1('tests/fixtures/lenna.avif'))
})
