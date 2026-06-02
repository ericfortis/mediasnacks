import { ok } from 'node:assert/strict'
import { statSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { cli, mkTempDir } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

describe('gif', () => {
	const tmp = mkTempDir('gif')
	const file = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), file)

	test('converts video to GIF', () => {
		cli('gif', file)
		ok(statSync(join(tmp, '60fps.gif')).size > 0)
	})
})
