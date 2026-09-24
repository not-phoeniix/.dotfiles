# initially generated things
HISTFILE=$HOME/.zsh_history
HISTSIZE=1000
SAVEHIST=1000
setopt autocd
unsetopt beep extendedglob nomatch notify
bindkey -v
bindkey '^H' backward-kill-word

zstyle :compinstall filename '$HOME/.zshrc'

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
alias yippee=yay
alias starwars="telnet towel.blinkenlights.nl"
alias md=mkdir
alias mdp=mkdir -p
alias sizeof='du -sh'

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

# syntax highlighting
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

