import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { ssim } from './ssim.js'
import { join } from 'node:path'
import { cli } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

test('ssim returns 1 for identical images', async () => {
	const { stdout } = cli('ssim',
		rel('fixtures/lenna.png'),
		rel('fixtures/lenna.png'))
	equal(stdout.toString(), '1\n')
})
