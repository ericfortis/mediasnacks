export interface AvifOptions {
	file: string
	outFile: string
	overwrite?: boolean
}
export function avif(options: AvifOptions): Promise<void>


export type TimeCode = number | string

export interface CountFramesOptions {
	file: string
	fps?: number
	start?: TimeCode
	end?: TimeCode
}
export function countframes(options: CountFramesOptions): Promise<number>

