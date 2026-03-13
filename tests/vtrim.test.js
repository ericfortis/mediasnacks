import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync, existsSync } from 'node:fs'
import { videoAttrs } from '../src/utils/ffmpeg.js'

test('vtrim trims video from start to end time', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vtrim-test-'))

	const inputFile = join(tmp, '60fps.mp4')
	cpSync('tests/fixtures/60fps.mp4', inputFile)

	execSync(`src/cli.js vtrim 5 10 ${inputFile}`)

	const out = join(tmp, '60fps.trim.mp4')
	ok(existsSync(out), 'Trimmed video should be created')

	const attrs = await videoAttrs(out)
	const duration = parseFloat(attrs.duration)

	// Duration should be approximately 5 seconds (10 - 5)
	ok(duration > 4.5 && duration < 5.5, `Duration should be ~5s, got ${duration}s`)
})
