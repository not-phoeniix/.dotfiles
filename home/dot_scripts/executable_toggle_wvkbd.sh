#!/bin/sh

source $HOME/.cache/wal/colors.sh

remove_octothorp() {
	VALUE=$(echo $1 | sed 's/#//')
	echo $VALUE
}

BG=$(remove_octothorp $background)
FG=$(remove_octothorp $foreground)
COL0=$(remove_octothorp $color0)
COL1=$(remove_octothorp $color1)
COL4=$(remove_octothorp $color4)

LAYERS="simple,special"
FONT="Papernotes"
FONT_SIZE=20
LANDSCAPE_HEIGHT=300

killall wvkbd-mobintl || wvkbd-mobintl --landscape-layers $LAYERS -fn "$FONT $FONT_SIZE" -L $LANDSCAPE_HEIGHT --bg $BG --fg $COL0 --fg-sp $COL0 --press $COL1 --press-sp $FG --swipe $COL4 --swipe-sp $COL4 --text $FG --text-sp $COL1

