import { test } from 'node:test'
import { join } from 'node:path'
import { equal } from 'node:assert/strict'
import { cli } from './utils/test-utils.js'
import { ssim } from './ssim.js'

const rel = f => join(import.meta.dirname, f)

test('ssim returns 1 for identical images', () => {
	const { stdout } = cli('ssim',
		rel('fixtures/lenna.png'),
		rel('fixtures/lenna.png'))
	equal(stdout.toString(), '1\n')
})
