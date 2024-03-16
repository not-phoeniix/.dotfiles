#!/usr/bin/env bash

# Hi! This is a quick script I wrote
# for my laptop that can change Ryzen cpu
# frequency presets on the fly!
#
# It requires "cpupower"

# variables
CPU_OPTION=nothing
ACCENT="\033[0;31m"
NC="\033[0m"

# prompt
echo -e "${ACCENT}CPU performance changer thingy!${NC}"
echo "  1. POWERSAVE"
echo "  2. PERFORMANCE"
echo "  3. ONDEMAND"
echo "  4. CONSERVATIVE"
echo -e $ACCENT

# reads user input
read -p "Please select an option: " USER_INPUT
echo -e $NC

# switch case thingy
case $USER_INPUT in
	1)
		CPU_OPTION=powersave
		;;
	2)
		CPU_OPTION=performance
		;;
	3)
		CPU_OPTION=ondemand
		;;
	4)
		CPU_OPTION=conservative
		;;
	*)
		read -p "Input not recognized! Press ENTER to exit"
		exit 1
		;;
esac

# actual COMMAND
sudo cpupower frequency-set -g $CPU_OPTION
echo -e $NC

# confirmation
echo -e "CPU frequency successfully set to ${ACCENT}${CPU_OPTION^^}!"
echo

# bye bye
read -p "Press enter to continue..."
echo -e $NC
