#!/usr/bin/env bash

#
# gssu.sh (grim-slurp screenshot utility dot sh (shell ))
# 

unset -v REGION_RECT # either "full" or "rect"
unset -v OPERATION # either "copy" or "save"
unset -v OUTPUT # monitor connector code thingy
SAVE_DATE_FORMAT='+%Y%m%d_%H%M%S'

scriptname=$(basename $0)

print_usage() {
	echo -e "Usage: $scriptname [OPTION]..."
	echo -e 'simple grim-slurp screenshot utility'
	echo -e ""
	echo -e "General Flags:"
	echo -e "  -h           \tprints this usage screen"
	echo -e "  -v           \tenables verbose command logging"
	echo -e "Regions:"
	echo -e "  -f           \tcapture full screen region"
	echo -e "  -o [OUTPUT]  \tcapture a specific output"
	echo -e "  -r           \tcapture rectangle region"
	echo -e "Operations:"
	echo -e "  -s           \tsave screenshot (saves to \$SCREENSHOT_DIR,"
	echo -e "               \tw/ fallbacks of \$XDG_PICTURES_DIR, \$HOME/Pictures)"
	echo -e "  -c           \tcopy screenshot"
	echo -e ""
	echo -e "Examples:"
	echo -e "  $scriptname -r -c         \tcapture and copy rectangular region of screen"
	echo -e "  $scriptname -fs -o DP-1   \tcapture and save fullscreen region of DP-1 output"
	echo -e "  $scriptname -h            \tbaha help me"
	echo -e "  $scriptname -vh           \tbaha help me but be really verbose about it"
}

# exits early w/ help message if nothing is passed in
if [[ -z "$@" ]]; then
	print_usage
	exit 0
fi

# === USER PROMPT ===============================

while getopts "hvfrcso:" opt; do
	case $opt in
		h) print_usage; exit 0 ;;
		v) set -o xtrace ;;
		f) REGION="full" ;;
		r) REGION="rect" ;;
		o) REGION="full"; OUTPUT=${OPTARG} ;;
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
grim ${REGION:+-g "$REGION"} ${OUTPUT:+-o "$OUTPUT"} - \
	| tee "$SCREENSHOT_DIR/$FILE_NAME" \
	| wl-copy

echo "screenshot ${OPERATION}d, have a nice day <3"

