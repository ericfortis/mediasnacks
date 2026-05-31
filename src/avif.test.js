import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'

import { ssim } from './ssim.js'
import { mkTempDir, cli } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

test('PNG to AVIF', async () => {
	const tmp = mkTempDir('avif')
	cli('avif', '--outdir', tmp, rel('fixtures/lenna.png'))

	const similarityScore = await ssim(join(tmp, 'lenna.avif'), rel('fixtures/lenna.avif'))
	ok(similarityScore > 0.99, `Similarity too low: ${similarityScore}`)
})
