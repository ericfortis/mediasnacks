import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import { join, dirname } from 'node:path'
import { mkdtemp, mkdir } from 'node:fs/promises'
import { lstatSync, glob as _glob } from 'node:fs'


export const glob = promisify(_glob)

export const lstat = f => lstatSync(f, { throwIfNoEntry: false })
export const isFile = path => lstat(path)?.isFile()

export const makeDirFor = async file => mkdir(dirname(file), { recursive: true })
export const makeTempDir = async () => mkdtemp(join(tmpdir(), 'mediasnacks-'))

export const replaceExt = (f, ext) => {
	const parts = f.split('.')
	if (parts.length > 1 && parts[0])
		parts.pop()
	parts.push(ext)
	return parts.join('.')
}
