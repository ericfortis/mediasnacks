import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import { unlink, rename } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { lstatSync, glob as _glob } from 'node:fs'


export const glob = promisify(_glob)

export const lstat = f => lstatSync(f, { throwIfNoEntry: false })
export const isFile = path => lstat(path)?.isFile()

export const replaceExt = (f, ext) => {
	const parts = f.split('.')
	if (parts.length > 1 && parts[0])
		parts.pop()
	parts.push(ext)
	return parts.join('.')
}

export const uniqueFilenameFor = file => 
	join(dirname(file), randomUUID() + extname(file))


export async function overwrite(src, target) {
	await unlink(target)
	await rename(src, target)
}
