#!/bin/bash

#
# hi :D this is the bash script you can use to apply my dotfiles :]
#

# ~~~ current dir checking ~~~

# exit early if script isn't run in its origin directory
script_dir=$(dirname -- "$(realpath -- "$0")")
if ! [[ $(pwd) == $script_dir ]]; then
	echo "ERR: Script must be run inside its stored directory!"
	exit 1
fi

# ~~~ dependency checking ~~~

DEPENDENCIES=(
	jq
	rsync
)

missing_deps=false
for dep in "${DEPENDENCIES[@]}"; do
	if ! command -v $dep 2>&1 >/dev/null; then
		missing_deps=true
		echo "ERR: Dependency command \"$dep\" not found!"
	fi
done

if [[ $missing_deps == true ]]; then
	echo "Dependencies missing! Unable to run..."
	exit 1
fi

# ~~~ symlink creation / file copying ~~~

# creates a symlink or copies file
#   $1: source
#   $2: destination
#   $3: operation, either "symlink" or "copy"
apply_target() {
	source=$(realpath --no-symlinks "$1")
	dest=$(realpath --no-symlinks "$2")

	if ! [ -e $source ]; then
		echo "ERR: source '$source' doesn't exist!"
		return 1
	fi

	# if we are copying and the destination is an existing FILE
	#   OR
	# if we are symlinking and destination exists AT ALL
	#
	# then prompt for overwrite
	if ([[ $3 == "copy" ]] && [ -f $dest ]) || ([[ $3 == "symlink" ]] && [ -e $dest ]); then
		input_valid=0
		while [[ $input_valid == 0 ]]; do
			read -r -p "target '$dest' already exists, would you like to overwrite? [y/N] " response </dev/tty

			case $response in
				[yY])
					echo "OKAY YEAH!!! OVERWRITING !!!!!!"
					input_valid=1
					;;

				"")
					;&
				[nN])
					echo "aw... okay,,,,, ... no overwrite...... :("
					return 0
					;;

				*)
					echo "input $response not recognized !!"
					;;
			esac
		done
	fi

	case $3 in
		"symlink")
			echo "symlinking '$source' to '$dest'..."
			rm -rf $dest
			ln -sf $source $dest
			;;

		"copy")
			echo "copying '$source' to '$dest'..."
			rsync -a $source $dest
			;;

		*)	
			echo "ERR: operation $3 not recognized!!!"
			return 1
			;;
	esac
}

# ~~~ JSON parsing / target operations ~~~

TRACKED_FILE="targets.json"
JSON=$(cat $TRACKED_FILE | sed "s|~|${HOME}|g") 

i=0
while read -r target; do
	itemJson=$(echo $JSON | jq ".[$i]")
	destination=$(echo $itemJson | jq -r ".path")
	source=$(echo $destination | sed "s|$HOME|\.\/home|g")
	operation=$(echo $itemJson | jq -r ".operation")

	apply_target $source $destination $operation

	i=$(($i + 1))

done <<< $(echo $JSON | jq -r ".[].path")

echo ""
echo "[[ done applying dotfiles :D ]]"
