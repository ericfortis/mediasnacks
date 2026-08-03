import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'

const rel = f => join(import.meta.dirname, f)

export const cli = (...args) => spawnSync(rel('../cli.js'), args)

export const dir = (...args) => mkdirSync(join(...args), { recursive: true })
export const touch = (...args) => writeFileSync(join(...args), '')

export const mkTempDir = (prefix = 'test-') => mkdtempSync(join(tmpdir(), prefix))

