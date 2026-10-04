import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'

import { ssim } from './ssim.js'
import { mkTempDir, cli } from './utils/test-utils.js'
import { videoAttrs } from './utils/videoAttrs.js'
import { runSilently } from './utils/subprocess.js'

const rel = f => join(import.meta.dirname, f)

const hasAvifenc = async () => {
	try {
		await runSilently('avifenc', ['--version'])
		return true
	}
	catch {
		return false
	}
}

test('PNG to AVIF (opaque)', async () => {
	const tmp = mkTempDir('avif')
	cli('avif', '--outdir', tmp, rel('fixtures/lenna.png'))

	const similarityScore = await ssim(join(tmp, 'lenna.avif'), rel('fixtures/lenna.avif'))
	ok(similarityScore > 0.98, `Similarity too low: ${similarityScore}`)
})

// ssim is useless here: ffmpeg demuxes the alpha auxiliary item as a second video
// stream, so it compares the alpha planes and even identical files score 0.815
test('PNG with transparency to AVIF', { skip: !await hasAvifenc() }, async () => {
	const tmp = mkTempDir('avif-alpha')
	cli('avif', '--outdir', tmp, rel('fixtures/alpha.png'))

	await runSilently('avifdec', [join(tmp, 'alpha.avif'), join(tmp, 'alpha.dec.png')])
	const { pix_fmt: pixFmt } = await videoAttrs(join(tmp, 'alpha.dec.png'))
	ok(/^(rgba|bgra|yuva)/.test(pixFmt), `Transparency lost: ${pixFmt}`)
})
