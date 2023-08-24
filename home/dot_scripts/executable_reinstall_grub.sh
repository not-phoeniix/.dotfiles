#!/bin/sh

# hi i made this script to quickly reinstall grub 
#   because my laptop keeps deleting it off of my 
#   fuckin bootloader (cringe HP)

sudo grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=artix
