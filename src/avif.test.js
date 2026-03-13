import { join } from 'node:path'
import { test } from 'node:test'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { deepEqual } from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'

import { videoAttrs } from './utils/ffmpeg.js'

const rel = f => join(import.meta.dirname, f)

test('PNG to AVIF', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'avif-test-'))
	execSync(`src/cli.js avif --output-dir ${tmp} ${rel('fixtures/lenna.png')}`)

	deepEqual(
		await videoAttrs(join(tmp, 'lenna.avif')),
		await videoAttrs(rel('fixtures/lenna.avif')))
		// That's because we use non-deterministic avif.
		// Claude says: avif is deterministic only when it's single-threaded: '-threads 1'
})
