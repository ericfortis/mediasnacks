export interface AvifOptions {
	file: string
	outFile: string
	overwrite?: boolean
}
export function avif(options: AvifOptions): Promise<void>

