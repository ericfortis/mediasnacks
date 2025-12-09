# Diffs two video files
# The videos must have the same resolution and ideally the same framerate.
video1="$1"
video2="$2"

ffplay -f lavfi "movie=$video1 [a]; movie=$video2 [b]; [a][b] blend=all_mode=difference128"

#all_mode=difference: absolute diff (ideal for detecting visual changes)
#all_mode=subtract: raw subtraction (can go <0, may appear darker)
#all_mode=difference128: shows neutral gray if identical, differences as dark/light shifts
