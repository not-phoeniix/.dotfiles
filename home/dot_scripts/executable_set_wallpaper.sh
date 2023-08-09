#!/bin/sh

# variables
unset -v IMG_PATH
unset -v BACKEND
unset -v SATURATION

USAGE="set_wallpaper.sh [-i] [-b] [-s]\n\t[-i image_path] \n\t[-b backend (wal/schemer2/colorz)] \n\t[-s saturation (0.0-1.0)]"

set -e

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	echo -e "usage: $USAGE"
	exit 0
fi

# parsing arguments
while getopts 'i:b:s:h' opt; do
	case "$opt" in
		i) # image path
			IMG_PATH="$OPTARG"
			;;

		b) # backend
			BACKEND="$OPTARG"
			;;

		s) # saturation
			SATURATION="$OPTARG"
			;;

		h) # help
			echo -e "usage: $USAGE"
			exit 0
			;;

		*) # everything else
			echo -e "usage: $USAGE"
			exit 1
			;;

	esac
done

# exits if not all arguments are filled
if [ -z "$IMG_PATH" ] || [ -z "$BACKEND" ] || [ -z "$SATURATION" ]; then
	echo "Error! missing one of the required options!"
	echo -e "usage: $USAGE"
	exit 1
fi

wal -n -i $IMG_PATH --backend $BACKEND --saturate $SATURATION

set +e

killall swaybg
swaybg -i "$IMG_PATH" &> /dev/null &

killall waybar
waybar &> /dev/null &

pywalfox update

~/.config/mako/update-theme.sh

echo
echo "successfully changed wallpaper and themes! :]"
