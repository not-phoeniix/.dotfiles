#!/bin/sh

# variables
unset -v IMG_PATH
unset -v THEME_NAME
SCHEMES_DIR=$HOME/.config/wal/colorschemes
USAGE="change_theme.sh [-l] [-t] [-i]\n\t[-l (lists pywal themes and exits)]\n\t[-t theme_name (without '.json')] \n\t[-i bg_image (path)]"

set -e

### USER PROMPT ===========================================

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	echo -e "usage: $USAGE"
	exit 0
fi

# parsing arguments (a colon after means it accepts arguments)
while getopts 't:i:hl' opt; do
	case "$opt" in
		h) # help
			echo -e "usage: $USAGE"
			exit 0
			;;

		l) # list themes
			echo "Currently installed pywal color schemes:"
			echo -e "$(find $SCHEMES_DIR -type f -printf ' - %f\n')"
			exit 0
			;;

		t) # theme name
			THEME_NAME="$OPTARG"
			;;

		i) # image path
			IMG_PATH="$OPTARG"
			;;

		*) # everything else
			echo -e "usage: $USAGE"
			exit 1
			;;

	esac
done

# exits if not all arguments are filled
if [ -z "$THEME_NAME" ] || [ -z "$IMG_PATH" ]; then
	echo "Error! missing one of the required options!"
	echo -e "usage: $USAGE"
	exit 1
fi

# exits if theme doesn't exist (in dark and light dirs)
if ! [ -f "$SCHEMES_DIR/dark/$THEME_NAME.json" ] && ! [ -f "$SCHEMES_DIR/light/$THEME_NAME.json" ]; then
	echo "Error! $THEME_NAME.json does not exist in ~/.config/wal/colorschemes"
	exit 1
fi

### UPDATE COLORS =========================================

# update pywal
wal -n -i $IMG_PATH
wal -n --theme $THEME_NAME

# update other app colors
spicetify config color_scheme $THEME_NAME &
$HOME/.config/mako/update-theme.sh &

### RESTART PROGRAMS ======================================

killall swaybg
swaybg -i "$IMG_PATH" &> /dev/null &

killall waybar
waybar &> /dev/null &

spicetify apply

echo
echo "successfully changed theme to $THEME_NAME! :]"
