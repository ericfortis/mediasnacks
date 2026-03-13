import { mkdir, unlink, rename } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { lstatSync, readFileSync } from 'node:fs'
import { randomUUID, createHash } from 'node:crypto'


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

export async function mkDir(path) {
	try {
		await mkdir(path, { recursive: true })
	}
	catch (err) {
		if (err.code !== 'EEXIST')
			throw err
	}
}

export function sha1(filePath) {
	return createHash('sha1')
		.update(readFileSync(filePath))
		.digest('base64')
}


