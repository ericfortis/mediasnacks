import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { cpSync, readdirSync, } from 'node:fs'

import { ssim } from './ssim.js'
import { cli, mkTempDir } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

describe('edgespic', () => {
	const tmp = mkTempDir('edgespic')
	const inputFile = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), inputFile)
	cli('edgespic', inputFile)

	test('creates output directory', () => {
		const files = readdirSync(join(tmp, 'edgespic'))
		ok(files.length === 2, `Expected 2 PNG files, got ${files.length}`)
	})

	test('extracts first frame', async () => {
		const out = join(tmp, 'edgespic', '60fps_first.png')
		const fixture = rel('fixtures/edgespic/60fps_first.png')
		const similarityScore = await ssim(out, fixture)
		ok(similarityScore > 0.99, `Similarity too low: ${similarityScore}`)
	})

	test('extracts last frame', async () => {
		const out = join(tmp, 'edgespic', '60fps_last.png')
		const fixture = rel('fixtures/edgespic/60fps_last.png')
		const similarityScore = await ssim(out, fixture)
		ok(similarityScore > 0.99, `Similarity too low: ${similarityScore}`)
	})
})

