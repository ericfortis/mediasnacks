import test from 'node:test'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { equal, deepEqual } from 'node:assert/strict'
import { mkdtempSync, cpSync, readdirSync } from 'node:fs'

import { queueDir } from '../../src/queuedir.js'


test('jobs get renamed and failed have their exit status code', async () => {
	const fixtures = join(import.meta.dirname, 'jobs')
	const tmp = join(mkdtempSync(join(tmpdir(), 'queuedir-')))

	cpSync(fixtures, tmp, { recursive: true })

	const err = await queueDir(tmp, 0.2)
	equal(err, null)

	const files = readdirSync(tmp).sort()
	deepEqual(files, [
		'job1_good.sh.done',
		'job2_bad.sh.failed.1',
		'job3_good.sh.done',
		'job4_bad.sh.failed.1'
	])
})
