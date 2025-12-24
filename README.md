# mediasnacks

Utilities optimizing and preparing video and images for the web.


## Usage Overview
**FFmpeg and Node.js must be installed.**

```shell
npx mediasnacks <command> <args>
```

Commands:
- `avif` Converts images to AVIF
- `resize` Resizes videos or images
- `sqcrop` Square crops images
- `moov2front` Rearranges .mov and .mp4 metadata for fast-start streaming
- `dropdups` Removes duplicate frames in a video
- `seqcheck` Finds missing sequence number
- `qdir` Sequentially runs all *.sh files in a folder
- `hev1tohvc1`: Fixes video thumbnails not rendering in macOS Finder 

- `framediff`: Plays a video of adjacent frames diff
- `videodiff`: Plays a video with the difference of two videos
- `vconcat`: Concatenates videos
 
- `dlaudio`: yt-dlp best audio
- `dlvideo`: yt-dlp best video
 
- `unemoji`: Removes emojis from filenames
- `rmcover`: Removes cover art 
 
- `curltime`: Measures request response timings
- `gif`: Video to GIF
- `vcut`: Split video in two parts at a given time
 
- `flattendir`: Moves unique files to the top dir and deletes empty dirs
<br/>

### Converting Images to AVIF
```shell
npx mediasnacks avif [-y | --overwrite] [--output-dir=<dir>] <images> 
```

<br/>

### Resizing Images or Videos
Resizes videos and images. The aspect ratio is preserved when only one dimension is specified.

`--width` and `--height` are `-2` by default:
- `-1` auto-compute while preserving the aspect ratio (may result in an odd number)
- `-2` same as `-1` but rounds to the nearest even number

```shell
npx mediasnacks resize [--width=<num>] [--height=<num>] [-y | --overwrite] [--output-dir=<dir>] <files>
```

Example: Overwrites the input file (-y)
```shell
npx mediasnacks resize -y --width 480 'dir-a/**/*.png' 'dir-b/**/*.mp4'
```

Example: Output directory (-o)
```shell
npx mediasnacks resize --height 240 --output-dir /tmp/out video.mov
```

<br/>

### Fast-Start Streaming Video
Rearranges .mov and .mp4 metadata to the start of the file for fast-start streaming.

**Files are overwritten**

```shell
npx mediasnacks moov2front <videos>
```
hat is Fast Start?
- https://wiki.avblocks.com/avblocks-for-cpp/muxer-parameters/mp4
- https://trac.ffmpeg.org/wiki/HowToCheckIfFaststartIsEnabledForPlayback


<br/>

### License
MIT
