import { equal, partialDeepStrictEqual, match } from 'node:assert/strict'
import { join } from 'node:path'
import { cpSync } from 'node:fs'
import { describe, test } from 'node:test'

import { cli, mkTempDir } from './utils/test-utils.js'
import { videoAttrs } from './utils/videoAttrs.js'

const rel = f => join(import.meta.dirname, f)

describe('sqcrop', () => {
	const tmp = mkTempDir('sqcrop')
	const file = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), file)

	test('crops to square preserving the center', async () => {
		cli('sqcrop', '-y', file)
		partialDeepStrictEqual(await videoAttrs(file), {
			width: 1080,
			height: 1080
		})
	})

	test('throws when output exists and overwrite is false', () => {
		const r = cli('sqcrop', file)
		equal(r.status, 1)
		match(r.stderr.toString(), /output file exists/)
	})

	test('throws when dimensions match original', () => {
		const r = cli('sqcrop', '-y', file)
		equal(r.status, 1)
		match(r.stderr.toString(), /already square/)
	})
})
