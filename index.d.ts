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


export function dlaudio(url: string): Promise<void>
export function dlvideo(url: string): Promise<void>


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

export function play(files: string[]): void


export interface ProResOptions {
	video: string
	profile: 1 | 2 | 3 | 4 | 5
	output: string
	start?: TimeCode
	end?: TimeCode
}
export function prores(options: ProResOptions): Promise<void>

export function qdir(dir: string, pollIntervalMs?: number): Promise<void>


export function openrand(dir: string, recursive?: boolean): void

export function pickRandomFile(dir: string, recursive?: boolean): string


interface ResizeBase {
	file: string
	outFile?: string
	overwrite?: boolean
}
export type ResizeOptions = ResizeBase & (
	| { width: number; height?: number }
	| { height: number; width?: number }
	)
export function resize(options: ResizeOptions): Promise<void>


export function seqcheck(dir: string, leftDelim?: string, rightDelim?: string): number[]


export interface SqCropOptions {
	file: string
	outFile: string
	overwrite?: boolean
}
export function sqcrop(options: SqCropOptions): Promise<void>


export function ssim(img1: string, img2: string): Promise<number>


export type Clip = [start: number, end: number]
export function vsplit(video: string, clips: Clip[]): Promise<void>


interface VtrimBase {
	video: string
}
export type VtrimOptions = VtrimBase & (
	| { start?: TimeCode; end: TimeCode }
	| { start: TimeCode; end?: TimeCode }
	)
export function vtrim(options: VtrimOptions): Promise<void>
