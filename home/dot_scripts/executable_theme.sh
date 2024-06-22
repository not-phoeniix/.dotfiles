#!/usr/bin/env bash

# variables
unset -v IMG_PATH
unset -v THEME_NAME
SCHEMES_DIR=$HOME/.config/wal/colorschemes
USAGE="change_theme.sh [-l] [-t] [-L] [-i]\n\t[-l (lists pywal themes and exits)]\n\t[-t theme_name (without '.json')]\n\t[-L (use flag if light mode)]\n\t[-i bg_image (path)]"

set -e

### USER PROMPT ===========================================

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	echo -e "usage: $USAGE"
	exit 0
fi

is_light_theme="false"

# parsing arguments (a colon after means it accepts arguments)
while getopts 't:i:hlL' opt; do
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

		L) # light mode
			is_light_theme="true"
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

if [[ $is_light_mode == "true" ]]; then
	wal -n --theme $THEME_NAME -l
else 
	wal -n --theme $THEME_NAME
fi

# update other app colors
spicetify config color_scheme $THEME_NAME &
$HOME/.config/mako/update-theme.sh &

### RESTART PROGRAMS ======================================

killall swaybg
swaybg -i "$IMG_PATH" &> /dev/null &

$HOME/.config/ags/open.sh

spicetify apply

echo
echo "successfully changed theme to $THEME_NAME! :]"
