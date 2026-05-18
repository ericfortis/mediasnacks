import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'

const rel = f => join(import.meta.dirname, f)

export function mkTempDir(prefix = 'test-') {
	return mkdtempSync(join(tmpdir(), prefix))
}

export function cli(...args) {
	spawnSync(rel('../cli.js'), args)
}

export function sha1(filePath) {
	return createHash('sha1')
		.update(readFileSync(filePath))
		.digest('base64')
}

export function dir(...args) {
	return mkdirSync(join(...args), { recursive: true })
}

export function touch(...args) {
	return writeFileSync(join(...args), '')
}

