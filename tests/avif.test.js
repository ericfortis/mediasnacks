import { join } from 'node:path'
import { test } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'

import { videoAttrs } from '../src/utils/ffmpeg.js'


test('PNG to AVIF', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'avif-test-'))
	execSync(`src/cli.js avif --output-dir ${tmp} ${join(import.meta.dirname, 'fixtures/lenna.png')}`)

	deepEqual(
		await videoAttrs(join(tmp, 'lenna.avif')),
		await videoAttrs(join(import.meta.dirname, 'fixtures/lenna.avif')))
		// That's because we use non-deterministic avif.
		// avif is deterministic only when it's single-threaded and with a fixed preset, such as
		//   '-svtav1-params', 'avif=1:preset=8',
		//   '-threads', '1',
})
