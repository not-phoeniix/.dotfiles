#!/usr/bin/env bash

source $HOME/.cache/wal/colors.sh

# substring colors
fg_col=${foreground:1}
bg_col=${background:1}
accent_col=${color1:1}
accent2_col=${color3:1}
transparent="00000000"

args=()

# image
args+=("--image" "$(cat $HOME/.cache/wal/wal)")
args+=("--scaling" "center")

# general config
args+=("--show-failed-attempts")
args+=("--ignore-empty-password")
args+=("--ignore-empty-password")
args+=("--font" "FiraCodeNerdFont-Bold")
args+=("--font-size" "26")

args+=("--indicator-radius" "50")
args+=("--indicator-thickness" "10")

# colors

args+=("--inside-color" $transparent)
args+=("--inside-clear-color" $accent_col)
args+=("--inside-caps-lock-color" $transparent)
args+=("--inside-ver-color" $transparent)
args+=("--inside-wrong-color" $transparent)

args+=("--key-hl-color" $transparent)
args+=("--bs-hl-color" $accent_col)
args+=("--caps-lock-key-hl-color" $accent_col)

args+=("--layout-bg-color" $transparent)
args+=("--layout-border-color" $transparent)

# actual command
swaylock "${args[@]}"

