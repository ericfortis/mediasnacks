import { equal, partialDeepStrictEqual, match } from 'node:assert/strict'
import { join } from 'node:path'
import { cpSync } from 'node:fs'
import { describe, test } from 'node:test'

import { cli, mkTempDir } from './utils/test-utils.js'
import { videoAttrs } from './utils/videoAttrs.js'

const rel = f => join(import.meta.dirname, f)

describe('resize', () => {
	const tmp = mkTempDir('resize')
	const file = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), file)

	test('by width, preserving aspect', async () => {
		cli('resize', '-y', '--width', 320, file)
		partialDeepStrictEqual(await videoAttrs(file), {
			width: 320,
			height: 180
		})
	})

	test('upscales height, preserving aspect', async () => {
		cli('resize', '-y', '--height', 240, file)
		partialDeepStrictEqual(await videoAttrs(file), {
			width: 426,
			height: 240
		})
	})

	test('resizes with exact dimensions', async () => {
		cli('resize', '-y', '--width', 200, '--height', 150, file)
		partialDeepStrictEqual(await videoAttrs(file), {
			width: 200,
			height: 150
		})
	})

	test('throws when dimensions match original', () => {
		const r = cli('resize', '--width', 200, '--height', 150, file)
		equal(r.status, 1)
		match(r.stderr.toString(), /no changes needed/)
	})

	test('throws when output exists and overwrite is false', () => {
		const r = cli('resize', '--width', 200, '--height', 200, file)
		equal(r.status, 1)
		match(r.stderr.toString(), /output file exists/)
	})
})
