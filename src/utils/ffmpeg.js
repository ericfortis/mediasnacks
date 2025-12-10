import { spawn } from 'node:child_process'


export async function ffmpeg(args) {
	return runSilently('ffmpeg', args)
}

export async function assertUserHasFFmpeg() {
	try {
		await runSilently('ffmpeg', ['-version'])
		await runSilently('ffprobe', ['-version'])
	}
	catch {
		throw new Error('ffmpeg not found. Please install ffmpeg.')
	}
}


async function runSilently(program, args) {
	return new Promise((resolve, reject) => {
		const stdout = []
		const stderr = []

		const p = spawn(program, args)
		p.stdout.on('data', chunk => { stdout.push(chunk) })
		p.stderr.on('data', chunk => { stderr.push(chunk) })

		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve({
					stdout: Buffer.concat(stdout).toString(),
					stderr: Buffer.concat(stderr).toString(),
				})
			else
				reject(new Error(`${program} failed with code ${code}\n${Buffer.concat(stderr).toString()}`))
		})
	})
}

export async function run(program, args) {
	return new Promise((resolve, reject) => {
		const p = spawn(program, args)
		p.stdout.on('data', data => process.stdout.write(data))
		p.stderr.on('data', chunk => process.stderr.write(chunk))

		p.on('error', reject)
		p.on('close', code => {
			if (code === 0)
				resolve()
			else
				reject(new Error(`${program} failed with code ${code}`))
		})
	})
}


/**
 * Describes disposition flags that define how the video stream should be treated
 * by players or downstream consumers.
 * @typedef {Object} VideoStreamDisposition
 * @prop {number} default Is whether this stream is the default selection.
 * @prop {number} dub is dubbed?
 * @prop {number} original is original?
 * @prop {number} comment contains commentary?
 * @prop {number} lyrics has lyrics?
 * @prop {number} karaoke is karaoke?
 * @prop {number} forced must always be rendered?
 * @prop {number} hearing_impaired targets hearing-impaired audiences?
 * @prop {number} visual_impaired targets visually-impaired audiences?
 * @prop {number} clean_effects removes certain effects or noise?
 * @prop {number} attached_pic represents embedded artwork?
 * @prop {number} timed_thumbnails timed thumbnail data?
 * @prop {number} non_diegetic non-diegetic content?
 * @prop {number} captions has captions?
 * @prop {number} descriptions has audio descriptions?
 * @prop {number} metadata has supplemental metadata?
 * @prop {number} dependent depends on another stream?
 * @prop {number} still_image still-image video content?
 * @prop {number} multilayer multilayer stream content?
 */

/**
 * Describes metadata tags associated with a video stream.
 * @typedef {Object} VideoStreamTags
 * @prop {string} language stream language.
 * @prop {string} handler_name handler or track label.
 * @prop {string} vendor_id vendor for the encoder or container.
 */

/**
 * Full set of attributes returned by ffprobe for a single video stream.
 * @typedef {Object} VideoStream
 * @prop {number} index Numerical index of the stream within the container.
 * @prop {string} codec_name Short codec identifier used by FFmpeg.
 * @prop {string} codec_long_name Descriptive codec name.
 * @prop {string} profile Codec profile used during encoding.
 * @prop {string} codec_type The media type, typically "video".
 * @prop {string} codec_tag_string Codec tag string declared in the container.
 * @prop {string} codec_tag Numeric codec tag in hexadecimal form.
 * @prop {number} width Video width in pixels.
 * @prop {number} height Video height in pixels.
 * @prop {number} coded_width Internal coded width, which may differ from output width.
 * @prop {number} coded_height Internal coded height.
 * @prop {number} has_b_frames Number of B-frames used by the encoder.
 * @prop {string} sample_aspect_ratio Pixel aspect ratio declared in the stream.
 * @prop {string} display_aspect_ratio Display aspect ratio after scaling.
 * @prop {string} pix_fmt Pixel format used by the video stream.
 * @prop {number} level Codec level used during encoding.
 * @prop {string} chroma_location The chroma sample position pattern.
 * @prop {string} field_order Field order (progressive, top-field-first, etc.).
 * @prop {number} refs Number of reference frames used by the encoder.
 * @prop {string} is_avc Indicates whether the stream uses AVC-style NAL units.
 * @prop {string} nal_length_size Length of NAL unit size prefixes.
 * @prop {string} id Stream identifier within the container.
 * @prop {string} r_frame_rate Raw frame rate reported by the demuxer.
 * @prop {string} avg_frame_rate Average frame rate.
 * @prop {string} time_base The fundamental time base of the stream.
 * @prop {number} start_pts Presentation timestamp where the stream begins.
 * @prop {string} start_time Wall-clock start time in seconds.
 * @prop {number} duration_ts Duration expressed in time-base units.
 * @prop {string} duration Stream duration in seconds.
 * @prop {string} bit_rate Declared bit rate of the video stream.
 * @prop {string} bits_per_raw_sample Bit depth of the raw samples.
 * @prop {string} nb_frames Number of frames according to the container.
 * @prop {number} extradata_size Size of the extra codec data.
 * @prop {VideoStreamDisposition} disposition Disposition flags describing playback intent.
 * @prop {VideoStreamTags} tags Metadata tags for the stream.
 */

/**
 * Extracts full metadata for the primary video stream (v:0) using ffprobe.
 * @param {string} video Path to the video file.
 * @returns {Promise<VideoStream>} All video stream attributes.
 */
export async function videoAttrs(v) {
	const { stdout } = await runSilently('ffprobe', [
		'-v', 'error',
		'-select_streams', 'v:0',
		'-show_entries', 'stream',
		'-of', 'json',
		v
	])
	return JSON.parse(stdout).streams[0]
}



