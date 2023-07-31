#!/bin/sh

swaymsg create_output HEADLESS-1
wayvnc --output=HEADLESS-1 --max-fps=20 10.0.0.137 5900 &
