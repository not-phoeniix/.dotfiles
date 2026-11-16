#!/bin/bash

#
# hi :D this is the bash script you can use to apply my dotfiles :]
#

# exit early if script isn't run in its origin directory
script_dir=$(dirname -- "$(realpath -- "$0")")
if ! [[ $(pwd) == $script_dir ]]; then
    echo "ERR: Script must be run inside its stored directory!"
    exit 1
fi

# ensure dependencies are installed
DEPENDENCIES=(
    jq
    rsync
)
for dep in "${DEPENDENCIES[@]}"; do
    if ! command -v $dep 2>&1 >/dev/null; then
        echo "ERR: Dependency \"$dep\" missing!"
        exit 1
    fi
done

# === helper funcs and stuff ==============================

mkdir_for_dest() {
    if [ -d "$1" ]; then
        mkdir -p "$1"
    else
        mkdir -p "$(dirname "$1")"
    fi
}

# $1: source
# $2: destination
apply_target_symlink() {
    local src=$(realpath --no-symlinks "$1")
    local dest=$(realpath --no-symlinks "$2")

    if ! [ -e "$src" ]; then
        echo "ERR: source '$src' doesn't exist!"
        return 1
    fi

    if [ -e "$dest" ]; then
        read -r -p "'$dest' already exists! overwrite, backup, or skip? [o/b/S] " response </dev/tty
        case $response in
            [oO]) echo "rm -rf '$dest'"; rm -rf "$dest" ;;
            [bB]) echo "mv '$dest' '$dest.bak'"; mv "$dest" "$dest.bak" ;;
            *) return 1 ;;
        esac
    fi

    echo "symlinking '$src' --> '$dest'"
    mkdir_for_dest "$dest"
    ln -sf "$src" "$dest"
}

# $1: source
# $2: destination
apply_target_copy() {
    local src=$(realpath --no-symlinks "$1")
    local dest=$(realpath --no-symlinks "$2")

    if [ ! -d "$dest" ] && [ -e "$dest" ]; then
        read -r -p "'$dest' already exists! overwrite, backup, or skip? [o/b/S] " response </dev/tty
        case $response in
            [oO]) echo "rm -rf '$dest'"; rm -rf "$dest" ;;
            [bB]) echo "mv '$dest' '$dest.bak'"; mv "$dest" "$dest.bak" ;;
            *) return 1 ;;
        esac
    fi

    echo "rsync -a '$src/' '$dest'"
    mkdir_for_dest "$dest"
    rsync -a "$src/" "$dest"
}

# $1: source
# $2: destination
# $3: operation, either "symlink" or "copy"
apply_target() {
    local src=$(realpath --no-symlinks "$1")
    local dest=$(realpath --no-symlinks "$2")

    case "$3" in
        "symlink") apply_target_symlink "$1" "$2" ;;
        "copy") apply_target_copy "$1" "$2" ;;
        *) echo "ERR: operation '$3' not recognized!"; exit 1 ;;
    esac
}

# === applying targets ====================================

TRACKED_FILE="targets.json"
for target in $(cat "$TRACKED_FILE" | jq -rc '.[]'); do
    op=$(echo $target | jq -r '.op')
    src=$(echo $target | jq -r '.src')
    dest=$(echo $target | jq -r '.dest' | sed "s|^~|$HOME|g")

    if [[ "$op" != "symlink" ]] && [[ "$op" != "copy" ]]; then
        echo "ERR: operation '$op' not recognized!"
        continue
    fi

    if [[ "$(basename "$src")" == '*' ]] && [ -d "$(dirname "$src")" ]; then
        # check for wildcard: apply all subtargets if src ends w/ "*"
        for f in $src; do
            echo "$f"
            apply_target "$f" "$dest/$(basename "$f")" "$op"
        done

    elif [ -e "$src" ]; then
        # apply normal files
        apply_target "$src" "$dest" "$op"

    else
        # anything else, error
        echo "ERR: src '$src' does not exist!!"
        exit 1
    fi
done

echo
echo "[[ done applying dotfiles :D ]]"
