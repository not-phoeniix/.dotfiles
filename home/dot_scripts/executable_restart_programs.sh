#!/bin/sh

IMG_DIR=$(cat ~/.cache/wal/wal)

wpg -a "$IMG_DIR"
wpg -s "$IMG_DIR"

killall swaybg
swaybg -i "$IMG_DIR" &> /dev/null &

killall waybar
waybar &> /dev/null &

pywalfox update

~/.config/mako/update-theme.sh

echo
echo "successfully reset workspace programs! :]"
