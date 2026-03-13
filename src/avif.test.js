import { join } from 'node:path'
import { test } from 'node:test'
import { deepEqual } from 'node:assert/strict'

import { videoAttrs } from './utils/ffmpeg.js'
import { mkTempDir, cli } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

test('PNG to AVIF', async () => {
	const tmp = mkTempDir('avif')
	cli('avif', '--output-dir', tmp, rel('fixtures/lenna.png'))

	deepEqual(
		await videoAttrs(join(tmp, 'lenna.avif')),
		await videoAttrs(rel('fixtures/lenna.avif')))
	// That's because we use non-deterministic avif.
	// Claude says: avif is deterministic only when it's single-threaded: '-threads 1'
})
