import { promisify } from 'node:util'
import { open, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { lstatSync, glob as _glob } from 'node:fs'
import { dirname, extname, basename, join } from 'node:path'


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


/**
 * Creates a unique temp file in the same directory as the given filepath.
 * The new file will have the same extension and a prefix based on the original name.
 * @param {string} file - Full path to the file to base the temp file on.
 * @returns {Promise<string>} - Full path to the new unique temp file.
 */
export async function makeTempFile(file) {
	const dir = dirname(file)
	const ext = extname(file)
	const base = basename(file, ext)

	while (true) {
		const f = join(dir, `${base}-${randomUUID()}${ext}`)
		try {
			const handle = await open(f, 'wx')
			await handle.close()
			await unlink(f)
			return f
		}
		catch (err) {
			if (err.code === 'EEXIST') 
				continue // unlikely, but retry
			throw err
		}
	}
}
