# initially generated things
HISTFILE=~/.zsh_history
HISTSIZE=1000
SAVEHIST=1000
setopt autocd
unsetopt beep extendedglob nomatch notify
bindkey -v
bindkey '^H' backward-kill-word

zstyle :compinstall filename '/home/nikki/.zshrc'

autoload -Uz compinit
compinit

# enable colors !!
autoload -U colors && colors
PS1="%{$fg[red]%}%n%{$reset_color%}@%{$fg[blue]%}%m %{$fg[yellow]%}%~ %{$reset_color%}%%"

# prompt
autoload -U promptinit; promptinit
prompt purer
export PURE_PROMPT_PATH_FORMATTING="%c"		# <- default value btw

# === aliases =================================
alias ls='ls --color=auto'
alias q='exit'
alias c='clear'
alias tty-clock='tty-clock -c -C 1'
alias feh='feh --scale-down'
alias unimatrix='unimatrix -c red -l o -s 94'
alias tablet-mode='setsysmode toggle'
alias chedit='chezmoi edit'
alias pacman-remove-orphans='sudo pacman -Qtdq | sudo pacman -Rns -'
alias yippee=yay

# === environment variables ===================
export EDITOR="nvim"
export VISUAL="nvim"
export TERM="foot"
export TERMINAL="foot"
export GOPATH"=$HOME/Go"
export QT_QPA_PLATFORM=wayland
export MOZ_ENABLE_WAYLAND=1
export MGFXC_WINE_PATH=/home/nikki/.winemonogame
export XDG_CACHE_HOME=$HOME/.cache/
export XDG_CONFIG_HOME=$HOME/.config/
export XDG_SCREENSHOTS_DIR=$HOME/Pictures/Screenshots/

# pfetch
export PF_INFO="ascii title os kernel wm shell pkgs memory"
export PF_COL1=5
export PF_COL2=7
export PF_COL3=3

# foot terminal emulator shell integration
function osc7-pwd() {
    emulate -L zsh # also sets localoptions for us
    setopt extendedglob
    local LC_ALL=C
    printf '\e]7;file://%s%s\e\' $HOST ${PWD//(#m)([^@-Za-z&-;_~])/%${(l:2::0:)$(([##16]#MATCH))}}
}

function chpwd-osc7-pwd() {
    (( ZSH_SUBSHELL )) || osc7-pwd
}
add-zsh-hook -Uz chpwd chpwd-osc7-pwd

# PATH
# export PATH=$PATH:~/pebble-dev/pebble-sdk-4.6-rc2-linux64/bin:~/.spicetify:~/.dotnet/tools:~/.scripts
export PATH=$PATH:~/.spicetify:~/.dotnet/tools:~/.scripts:~/.local/bin

