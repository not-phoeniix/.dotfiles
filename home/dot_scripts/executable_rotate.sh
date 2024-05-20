#!/usr/bin/env bash

#
# script for rotating my silly little HP Envy x360 :3 
# (made for hyprland)
#

ROT_CACHE="$HOME/.cache/rotation"

rotate_cw() {
	CURRENT_ROT=$(cat $ROT_CACHE)
	let CURRENT_ROT-=1

	if [[ $CURRENT_ROT -lt 0 ]]; then
		CURRENT_ROT=3
	fi

	echo $CURRENT_ROT > $ROT_CACHE
}

rotate_ccw() {
	CURRENT_ROT=$(cat $ROT_CACHE)
	let CURRENT_ROT+=1

	if [[ $CURRENT_ROT -gt 3 ]]; then
		CURRENT_ROT=0
	fi

	echo $CURRENT_ROT > $ROT_CACHE
}

set_rot() {
	echo $1 > $ROT_CACHE
}

update_hypr() {
	CURRENT_ROT=$(cat $ROT_CACHE)

	hyprctl keyword monitor eDP-1,preferred,auto,1,transform,$CURRENT_ROT

	echo "rotated to value of $CURRENT_ROT!"
}

case "$1" in
	"--cw")
		rotate_cw
		;;

	"--ccw")
		rotate_ccw
		;;

	"--reset")
		set_rot 0
		;;

	"--flip")
		set_rot 2
		;;

	"--set-rot")
		set_rot $2
		;;

	*)
		echo "option $1 not recognized!"
		exit 1
		;;

esac

update_hypr
sleep 0.1
eww reload
