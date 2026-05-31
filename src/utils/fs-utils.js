import { randomUUID } from 'node:crypto'
import { lstatSync, readdirSync } from 'node:fs'
import { mkdir, unlink, rename } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'


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

export function findFiles({ dir, regex, recursive, ignoredDirs = [] }) {
	return readdirSync(dir, { withFileTypes: true, recursive })
		.filter(entry =>
			entry.isFile()
			&& !entry.name.startsWith('.')
			&& !ignoredDirs.some(d => entry.parentPath.includes(d))
			&& regex.test(entry.name))
		.map(entry => join(entry.parentPath, entry.name))
}
