import { ok } from 'node:assert/strict'
import { statSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test } from 'node:test'

import { cli, mkTempDir } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

describe('png', () => {
	const tmp = mkTempDir('png')
	const file = join(tmp, '60fps.png')
	cpSync(rel('fixtures/edgespic/60fps_first.png'), file)
	const origSize = statSync(file).size

	test('losslessly optimizes PNG, making it smaller', () => {
		cli('png', file)
		ok(statSync(file).size < origSize)
	})
})
