#!/usr/bin/env sh

#
# script grabbed from https://wiki.hyprland.org/Configuring/Uncommon-tips--tricks/
# 

HYPRGAMEMODE=$(hyprctl getoption animations:enabled | awk 'NR==1{print $2}')
if [ "$HYPRGAMEMODE" = 1 ] ; then
    hyprctl --batch "\
        keyword animations:enabled 0;\
        keyword decoration:drop_shadow 0;\
        keyword decoration:blur:enabled 0;\
        keyword decoration:rounding 0;\
		keyword general:col.active_border 0xffff0000;\
		keyword misc:vfr 1"
    exit
fi

hyprctl reload

