export type TimeCode = number | string


export interface AvifOptions {
	file: string
	outFile: string
	overwrite?: boolean
}
export function avif(options: AvifOptions): Promise<void>


export interface CountFramesOptions {
	file: string
	fps?: number
	start?: TimeCode
	end?: TimeCode
}
export function countframes(options: CountFramesOptions): Promise<number>


export interface DetectDupsOptions {
	video: string
	seek?: TimeCode
	duration?: TimeCode
}
export function detectdups(options: DetectDupsOptions): Promise<number>


export function dropdups(video: string, dupFrameNum?: number): Promise<void>

export function edgespic(video: string, width: number, outDir: string): Promise<void>


export interface FrameSeqOptions {
	video: string
	fps?: number
	start?: TimeCode
	end?: TimeCode
	pad?: number
	outdir?: string
}
export function frameseq(options: FrameSeqOptions): Promise<void>


export function hev1tohvc1(file: string): Promise<void>

export function moov2front(file: string): Promise<void>
