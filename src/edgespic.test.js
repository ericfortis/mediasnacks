import { join } from 'node:path'
import { ok, notEqual } from 'node:assert/strict'
import { describe, test } from 'node:test'
import { cpSync, readdirSync, } from 'node:fs'

import { ffmpeg } from './utils/ffmpeg.js'
import { cli, mkTempDir, sha1 } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

describe('edgespic', () => {
	const tmp = mkTempDir('edgespic')
	const inputFile = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), inputFile)
	cli('edgespic', inputFile)

	const first = join(tmp, 'edgespic', '60fps_first.png')
	const last = join(tmp, 'edgespic', '60fps_last.png')

	test('creates output directory', () => {
		const files = readdirSync(join(tmp, 'edgespic'))
		ok(files.length === 2, `Expected 2 PNG files, got ${files.length}`)
	})

	test('first and last are not equal', () => {
		notEqual(sha1(first), sha1(last))
	})

	test('extracts first frame', async () => {
		const fixture_first = rel('fixtures/edgespic/60fps_first.png')
		const score = await ssim(first, fixture_first)
		ok(score > 0.99, `SSIM too low: ${score}`)
	})

	test('extracts last frame', async () => {
		const fixture_last = rel('fixtures/edgespic/60fps_last.png')
		const score = await ssim(last, fixture_last)
		ok(score > 0.99, `SSIM too low: ${score}`)
	})
})

async function ssim(image1, image2) {
	const result = await ffmpeg([
		'-i', image1,
		'-i', image2,
		'-filter_complex', 'ssim',
		'-f', 'null', '-'
	])
	const match = result.stderr.match(/All:([\d.]+)/)
	if (!match)
		throw new Error(`Could not parse SSIM output:\n${result.stderr}`)
	return parseFloat(match[1])
}
