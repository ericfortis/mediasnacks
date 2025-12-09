# Plays a video with a filter for diffing adjacent frames.
# I use this for finding repeated frames. For example, you’ll see 
# a black frame if two consecutive frames are almost similar.

# The frame number is rendered at the top-left.

ffplay -hide_banner -xerror "$1" -vf "
    tblend=all_mode=difference,
    format=gray,
    drawtext=text='%{n}':x=20:y=20:fontcolor=white:fontsize=48
"
