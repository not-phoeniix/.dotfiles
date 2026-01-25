#!/usr/bin/env bash

# variables
unset -v IMG_PATH
unset -v THEME_NAME
SCHEMES_DIR=$XDG_CONFIG_HOME/desktop/themes
HYPR_GTK_CACHE_PATH=$XDG_CACHE_HOME/wal/hypr_gtk_themes.conf
THEME_CACHE_DIR=$XDG_CACHE_HOME/wal
THEME_CACHE_FILE=$THEME_CACHE_DIR/previous_theme
USAGE="change_theme.sh [-l] [-r] [-t] [-L] [-i]\n\t[-l (lists pywal themes and exits)]\n\t[-r (reloads existing theme from cache)]\n\t[-t theme_name (without '.json')]\n\t[-i bg_image (path)]"

set -e

# create files if they don't exist yet
mkdir -p $THEME_CACHE_DIR
touch $THEME_CACHE_FILE

### USER PROMPT ===========================================

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	echo -e "usage: $USAGE"
	exit 0
fi

# parsing arguments (a colon after means it accepts arguments)
while getopts 't:i:hlLr' opt; do
	case "$opt" in
		h) # help
			echo -e "usage: $USAGE"
			exit 0
			;;

		l) # list themes
			echo "Currently installed color schemes:"
			echo -e "$(find -L $SCHEMES_DIR -type f -printf ' - %f\n')"
			exit 0
			;;

		r) # reload current theme
			THEME_NAME=$(cat $THEME_CACHE_FILE)
			;;

		t) # theme name
			THEME_NAME="$OPTARG"
			;;

		i) # image path
			IMG_PATH="$OPTARG"
			echo $IMG_PATH > $THEME_CACHE_DIR/wal
			;;

		*) # everything else
			echo -e "usage: $USAGE"
			exit 1
			;;

	esac
done

# exits if not all arguments are filled
if [ -z "$THEME_NAME" ]; then
	echo "Error! Missing required argument 'theme_name'"
	echo -e "usage: $USAGE"
	exit 1
fi

# exits if theme doesn't exist
if ! [ -f "$SCHEMES_DIR/$THEME_NAME.json" ]; then
	echo "Error! $THEME_NAME.json does not exist in $SCHEMES_DIR"
	exit 1
fi

# write theme to cache every time it's changed
echo $THEME_NAME > $THEME_CACHE_FILE

### UPDATE COLORS =========================================

echo "hi"

wal -n --theme $SCHEMES_DIR/$THEME_NAME
FILE_CONTENTS=$(cat "$SCHEMES_DIR/$THEME_NAME.json")

GTK_THEME=$(echo $FILE_CONTENTS | jq ".gtkTheme" -r)
echo "GTK theme in file: '$GTK_THEME'!"
GTK_ICONS=$(echo $FILE_CONTENTS | jq ".gtkIcons" -r)
echo "GTK icon theme in file: '$GTK_ICONS'!"

echo "\$gtk_theme = '$GTK_THEME'" > $HYPR_GTK_CACHE_PATH
echo "\$icon_theme = '$GTK_ICONS'" >> $HYPR_GTK_CACHE_PATH
echo "exec = gsettings set org.gnome.desktop.interface gtk-theme \$gtk_theme" >> $HYPR_GTK_CACHE_PATH
echo "exec = gsettings set org.gnome.desktop.interface icon-theme \$icon_theme" >> $HYPR_GTK_CACHE_PATH

# update other app colors
# spicetify config color_scheme $THEME_NAME &

### RESTART PROGRAMS ======================================

pkill ags
pkill gjs
ags run ~/.config/astal/app.ts &> /dev/null &

# spicetify apply

# apply background if the image path was ever specified
if ! [ -z "$IMG_PATH" ]; then
	echo "setting image to $IMG_PATH"
	swww img "$IMG_PATH"
else
	echo "image never specified, keeping the same!"
fi

hyprctl reload

echo
echo "successfully changed theme to $THEME_NAME! :]"
