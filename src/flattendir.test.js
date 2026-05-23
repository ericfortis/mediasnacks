import { test } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { readdirSync } from 'node:fs'

import { mkTempDir, cli, dir, touch } from './utils/test-utils.js'

test('flattendir moves files to top level and deletes empty dirs', () => {
	const tmp = mkTempDir('flattendir')
	dir(tmp, 'dir1', 'dir1-1')
	dir(tmp, 'dir2')
	touch(tmp, 'file1.txt')
	touch(tmp, 'dir1', 'file2.txt')
	touch(tmp, 'dir1', 'dir1-1', 'file3.txt')
	touch(tmp, 'dir1', '.DS_Store')

	cli('flattendir', tmp)
	deepEqual(readdirSync(tmp).sort(), [
		'file1.txt',
		'file2.txt',
		'file3.txt'
	])
})

test('flattendir does not move files if filename collision occurs', () => {
	const tmp = mkTempDir('flattendir-collision')
	dir(tmp, 'dir1')
	touch(tmp, 'file1.txt')
	touch(tmp, 'dir1', 'file1.txt')

	cli('flattendir', tmp)
	deepEqual(readdirSync(tmp, { recursive: true }).sort(), [
		'dir1',
		'dir1/file1.txt',
		'file1.txt'
	])
})
