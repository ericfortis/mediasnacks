import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ok, equal } from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { describe, test } from 'node:test'
import { mkdtempSync, cpSync, readdirSync, } from 'node:fs'

import { sha1 } from './utils/fs-utils.js'

const rel = f => join(import.meta.dirname, f)

describe('edgespic', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'edgespic-'))
	const inputFile = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), inputFile)
	spawnSync(rel('cli.js'), ['edgespic', inputFile])

	test('creates output directory', () => {
		const files = readdirSync(join(tmp, 'edgespic'))
		ok(files.length === 2, `Expected 2 PNG files, got ${files.length}`)
	})

	test('extracts first frame', () => {
		const fixture = rel('fixtures/edgespic/60fps_first.png')
		const generated = join(tmp, 'edgespic', '60fps_first.png')
		equal(sha1(generated), sha1(fixture))
	})

	test('extracts last frame', () => {
		const fixture = rel('fixtures/edgespic/60fps_last.png')
		const generated = join(tmp, 'edgespic', '60fps_last.png')
		equal(sha1(generated), sha1(fixture))
	})
})
