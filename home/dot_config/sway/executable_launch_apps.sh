#!/bin/sh

#
# A script that checks if a command exists (is installed on this system) and then launches it 
#

# apps to launch
declare -a apps=(
	"openrgb"
	"corectrl"
	"/mnt/games/immich_app/start_immich.sh"
)

# loop for launching/notifying
for i in "${apps[@]}"
do
	echo "starting $i..."
	if ! command -v "$i" &> /dev/null
		then
			echo "$i not found on system!"
		else
			"$i" &
	fi
done 

