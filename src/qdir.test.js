import { test } from 'node:test'
import { join } from 'node:path'
import { equal, deepEqual } from 'node:assert/strict'
import { cpSync, readdirSync } from 'node:fs'

import { qdir } from './qdir.js'
import { mkTempDir } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

test('qdir-jobs get renamed and failed have their exit status code', async () => {
	const tmp = mkTempDir('qdir')
	cpSync(rel('fixtures/qdir-jobs'), tmp, { recursive: true })

	const err = await qdir(tmp, 0.2)
	equal(err, null)

	deepEqual(readdirSync(tmp).sort(), [
		'job1_good.sh.done',
		'job2_bad.sh.failed.1',
		'job3_good.sh.done',
		'job4_bad.sh.failed.1'
	])
})
