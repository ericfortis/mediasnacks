import { test } from 'node:test'
import { ok, equal } from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { mkTempDir, touch, cli } from './utils/test-utils.js'

test('unemoji', () => {
	const dir = mkTempDir('unemoji-')
	touch(dir, 'smile 😊 .mp4')
	touch(dir, 'hello world.txt')

	cli('unemoji', dir)
	ok(existsSync(join(dir, 'smile.mp4')))
	ok(!existsSync(join(dir, 'smile 😊 .mp4')))
	ok(existsSync(join(dir, 'hello world.txt')))
})
