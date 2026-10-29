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
    echo -e "  $scriptname -i awesome.png    \tsets just background image"
    echo -e "  $scriptname -l                \tlists installed themes"
    echo -e "  $scriptname -r                \treloads current theme"
}

print_installed_themes() {
    echo "currently installed themes:"
    echo -e "$(find -L $SCHEMES_DIR -type f -iname "*.json" -printf ' - %f\n' | sed 's/\.json$//gi')"
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
        h) print_usage; exit 0 ;;
        l) print_installed_themes; exit 0 ;;

        r) THEME_NAME=$(cat $THEME_CACHE_FILE) ;;
        t) THEME_NAME="$OPTARG" ;;
        i) IMG_PATH="$OPTARG";;

        *) print_usage; exit 1 ;;
    esac
done

echo $IMG_PATH > $THEME_CACHE_DIR/wal

if [ -z "$THEME_NAME" ] && [ -f "$THEME_CACHE_FILE" ]; then
    THEME_NAME=$(cat $THEME_CACHE_FILE);
fi
if [ -z "$THEME_NAME" ]; then
    echo "Error! theme name missing & cache not found!"
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

write_niri_cache() {
    NIRI_JSON=$(echo "$FILE_CONTENTS" | jq '.niri')

    rm -f $NIRI_THEME_CACHE_PATH

    cat >> $NIRI_THEME_CACHE_PATH << EOF
spawn-sh-at-startup "$GTK_THEME_CMD"
spawn-sh-at-startup "$GTK_ICONS_CMD"
EOF

    NIRI_CORNER_RADIUS=$(echo $NIRI_JSON | jq ".cornerRadius" -r)
    if [[ "$NIRI_CORNER_RADIUS" != "null" ]]; then
        cat >> $NIRI_THEME_CACHE_PATH << EOF

window-rule {
        geometry-corner-radius $NIRI_CORNER_RADIUS
}
EOF
    fi

    NIRI_ACCENT_COLOR=$(echo $NIRI_JSON | jq ".accentColor" -r | sed 's/\$//g')
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
}

# write cache if niri is installed lol
if command -v niri >/dev/null 2>&1; then
    write_niri_cache
fi

### RESTART PROGRAMS ======================================

# apply theme if bited is running lol
if pgrep bited >/dev/null 2>&1; then
    bited themeFile $FULL_THEME_PATH
fi

# apply background if awww is installed && 
#   the image path was ever specified
if command -v awww >/dev/null 2>&1 && ! [ -z "$IMG_PATH" ]; then
    echo "setting image to $IMG_PATH"
    awww img "$IMG_PATH"
else
    echo "image never specified, keeping the same!"
fi

echo
echo "successfully changed theme to $THEME_NAME! :]"
