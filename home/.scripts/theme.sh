#!/usr/bin/env bash

# variables
unset -v IMG_PATH
unset -v THEME_NAME
DESKTOP_DIR_NAME=desktop
SCHEMES_DIR=$(realpath $XDG_CONFIG_HOME/$DESKTOP_DIR_NAME/themes)
NIRI_THEME_CACHE_PATH=$(realpath $XDG_CACHE_HOME/$DESKTOP_DIR_NAME/theme-niri.kdl)
THEME_CACHE_DIR=$(realpath $XDG_CACHE_HOME/wal)
THEME_CACHE_FILE=$(realpath $THEME_CACHE_DIR/previous_theme)

scriptname=$(basename $0)

print_usage() {
	echo -e "Usage: $scriptname [OPTION]..."
	echo -e "desktop theme changer !"
	echo
	echo -e "Flags:"
	echo -e "  -h           \tprints this message !"
	echo -e "  -l           \tlists all installed themes"
	echo -e "  -r           \treloads currently cached theme"
	echo -e "  -t [THEME]   \ttheme to set"
	echo -e "  -i [IMG_PATH]\tbackground image to set"
	echo
	echo -e "Examples:"
	echo -e "  $scriptname -t w95 -i blue.png\tsets theme and background"
	echo -e "  $scriptname -l                \tlists installed themes"
	echo -e "  $scriptname -r                \treloads current theme"
}

set -e

# create files if they don't exist yet
mkdir -p $THEME_CACHE_DIR
touch $THEME_CACHE_FILE

### USER PROMPT ===========================================

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	print_usage
	exit 0
fi

# parsing arguments (a colon after means it accepts arguments)
while getopts 't:i:hlLr' opt; do
	case "$opt" in
		h) # help
			print_usage
			exit 0
			;;

		l) # list themes
			echo "currently installed themes:"
			echo -e "$(find -L $SCHEMES_DIR -type f -iname "*.json" -printf ' - %f\n' | sed 's/\.json$//gi')"
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
			print_usage
			exit 1
			;;

	esac
done

# exits if not all arguments are filled
if [ -z "$THEME_NAME" ]; then
	echo "Error! Missing required argument 'theme_name'"
	print_usage
	exit 1
fi

FULL_THEME_PATH=$(realpath "$SCHEMES_DIR/$THEME_NAME.json")

# exits if theme doesn't exist
if ! [ -f "$FULL_THEME_PATH" ]; then
	echo "Error! $THEME_NAME.json does not exist in $SCHEMES_DIR"
	exit 1
fi

# write theme to cache every time it's changed
echo $THEME_NAME > $THEME_CACHE_FILE

### UPDATE COLORS =========================================

wal -n --theme $SCHEMES_DIR/$THEME_NAME
FILE_CONTENTS=$(cat $FULL_THEME_PATH)

GTK_THEME=$(echo $FILE_CONTENTS | jq ".gtkTheme" -r)
GTK_ICONS=$(echo $FILE_CONTENTS | jq ".gtkIcons" -r)
GTK_THEME_CMD="gsettings set org.gnome.desktop.interface gtk-theme '$GTK_THEME'"
GTK_ICONS_CMD="gsettings set org.gnome.desktop.interface icon-theme '$GTK_ICONS'"

eval $GTK_THEME_CMD
eval $GTK_ICONS_CMD

### NIRI THEME CACHE FILE =================================

rm -f $NIRI_THEME_CACHE_PATH

cat >> $NIRI_THEME_CACHE_PATH << EOF
spawn-sh-at-startup "$GTK_THEME_CMD"
spawn-sh-at-startup "$GTK_ICONS_CMD"
EOF

NIRI_CORNER_RADIUS=$(echo $FILE_CONTENTS | jq ".niriCornerRadius" -r)
if [[ "$NIRI_CORNER_RADIUS" != "null" ]]; then
cat >> $NIRI_THEME_CACHE_PATH << EOF

window-rule {
	geometry-corner-radius $NIRI_CORNER_RADIUS
}
EOF
fi

NIRI_ACCENT_COLOR=$(echo $FILE_CONTENTS | jq ".niriAccentColor" -r | sed 's/\$//g')
if [[ "$NIRI_ACCENT_COLOR" != "null" ]]; then
	theme_file_val=$(cat "$THEME_CACHE_DIR/colors.json" | jq ".colors.$(echo "$NIRI_ACCENT_COLOR" | sed 's/\#//g')" -r)
	if [[ "$theme_file_val" == "null" ]]; then
		theme_file_val=$NIRI_ACCENT_COLOR
	fi

cat >> $NIRI_THEME_CACHE_PATH << EOF

layout {
	focus-ring {
		active-color "$theme_file_val"
	}

	insert-hint {
		color "${theme_file_val}80"
	}
}
EOF
fi

### RESTART PROGRAMS ======================================

bited themeFile $FULL_THEME_PATH

# apply background if the image path was ever specified
if ! [ -z "$IMG_PATH" ]; then
	echo "setting image to $IMG_PATH"
	awww img "$IMG_PATH"
else
	echo "image never specified, keeping the same!"
fi

echo
echo "successfully changed theme to $THEME_NAME! :]"
