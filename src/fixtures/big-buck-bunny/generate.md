# Generating Fixtures


## 1. Download a video (Big Buck Bunny)

```sh
curl https://download.blender.org/peach/bigbuckbunny_movies/big_buck_bunny_1080p_h264.mov -o bbb_full_24fps.mov
```

## 2. Extract a scene
Using the third scene because it's complex enough to cover many edge cases.
It has a bird flapping its wings with motion blur. Also, animated text titles, 
and fairly static frames after the title ends.

The scene is 1080p, 24fps, 7.28sec, h.264.
```sh
brew tap ericfortis/fcpscene
brew install fcpscene
fcpscene -m files bbb_full_24fps.mov 

cp bbb/bbb_full_24fps_003.mov ./bbb_24fps_no_dups.mov
rm -rf bbb
rm bbb_full_24fps.mov  
```

## 3. Re-encode the scene 24fps
This way all videos will share the same encoding, and no audio.

```sh
ffmpeg -i bbb_24fps_no_dups.mov \
  -c:v libx264 -crf 18 -preset slow \
  -an \
  bbb_24fps_no_dups.mp4
```

## 4. Retime (no dups) speed stretch to 25fps
For a good (no dups) 25fps, retiming by speeding it up.
```sh
ffmpeg -i bbb_24fps_no_dups.mp4 \
  -vf "setpts=24/25*PTS" \
  -r 25 \
  bbb_25fps_no_dups.mp4
```


## 5. Retime by inserting duplicates (no interpolation)
```sh
for TARGET_FPS in 48 30 25; do
  ffmpeg -i bbb_24fps_no_dups.mp4 \
    -vf fps=$TARGET_FPS \
    -c:v libx264 -crf 18 -preset slow \
    -an \
    "bbb_24_to_${TARGET_FPS}fps_dup.mp4"
done

for TARGET_FPS in 60 50 30; do
  ffmpeg -i bbb_25fps_no_dups.mp4 \
    -vf fps=$TARGET_FPS \
    -c:v libx264 -crf 18 -preset slow \
    -an \
    "bbb_25_to_${TARGET_FPS}fps_dup.mp4"
done
```
Counting the cycle from 1 (not from 0):

- 24 to 48 (inserts dup at n=2) 0101
- 25 to 50 (inserts dup at n=2) 0101
- 24 to 30 (inserts dup at n=5) 0000100001
- 25 to 30 (inserts dup at n=6) 000001000001
- 24 to 25 (inserts dup at n=25) (0*24)1
- 25 to 60 (inserts dup at n=2 and n=3) 01011
