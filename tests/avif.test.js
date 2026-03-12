import { join } from 'node:path'
import { test } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'

import { videoAttrs } from '../src/utils/ffmpeg.js'


test('PNG to AVIF', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'avif-test-'))
	execSync(`src/cli.js avif --output-dir ${tmp} tests/fixtures/lenna.png`)

	deepEqual(
		await videoAttrs(join(tmp, 'lenna.avif')),
		await videoAttrs('tests/fixtures/lenna.avif'))
})
