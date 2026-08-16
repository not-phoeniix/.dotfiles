#!/bin/bash

#
# gssu.sh (grim-slurp screenshot utility dot sh (shell ))
# 

unset -v REGION_RECT # either "full" or "rect"
unset -v OPERATION # either "copy" or "save"
SAVE_DATE_FORMAT='+%Y%m%d_%H%M%S'

print_usage() {
	echo -e "Usage: gssu.sh [OPTION]..."
	echo -e 'simple grim-slurp screenshot utility'
	echo -e ""
	echo -e "General Flags:"
	echo -e "  -h\t\t\tprints this usage screen"
	echo -e "  -v\t\t\tenables verbose command logging"
	echo -e "Regions:"
	echo -e "  -f\t\t\tcapture full screen region"
	echo -e "  -r\t\t\tcapture rectangle region"
	echo -e "Operations:"
	echo -e "  -s\t\t\tsave screenshot (saves to \$SCREENSHOT_DIR,"
	echo -e "    \t\t\tw/ fallbacks of \$XDG_PICTURES_DIR, \$HOME/Pictures)"
	echo -e "  -c\t\t\tcopy screenshot"
	echo -e ""
	echo -e "Examples:"
	echo -e "  gssu.sh -r -c\t\tcapture and copy rectangular region of screen"
	echo -e "  gssu.sh -fs\t\tcapture and save fullscreen region of screen"
	echo -e "  gssu.sh -h\t\tbaha help me"
	echo -e "  gssu.sh -vh\t\tbaha help me but be really verbose about it"
}

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	print_usage
	exit 0
fi

# === USER PROMPT ===============================

while getopts "hvfrcs" opt; do
	case $opt in
		h) print_usage; exit 0 ;;
		v) set -o xtrace ;;
		f) REGION="full" ;;
		r) REGION="rect" ;;
		c) OPERATION="copy" ;;
		s) OPERATION="save" ;;
	esac
done

if [ -z "$REGION" ]; then
	echo "Missing required region flag!"
	exit 1
fi

if [ -z "$OPERATION" ]; then
	echo "Missing required operation flag!"
	exit 1
fi

# === SCREENSHOT OPERATIONS =====================

if [ -z "$SCREENSHOT_DIR" ]; then SCREENSHOT_DIR="$XDG_PICTURES_DIR"; fi
if [ -z "$SCREENSHOT_DIR" ]; then SCREENSHOT_DIR="$HOME/Pictures"; fi

FILE_NAME="$(date "$SAVE_DATE_FORMAT").png"

if [ "$OPERATION" != "save" ]; then 
	SCREENSHOT_DIR="/tmp/"
	FILE_NAME="screenshot.png"
fi

if [ "$REGION" = "rect" ]; then
	REGION="$(slurp)"
else
	unset -v REGION
fi

# actual operation, conditional flags (wacky ik)
grim ${REGION:+-g "$REGION"} - \
	| tee "$SCREENSHOT_DIR/$FILE_NAME" \
	| wl-copy

echo "screenshot ${OPERATION}d, have a nice day <3"

