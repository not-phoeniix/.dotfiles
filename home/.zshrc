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

# load any modules in $HOME/.zsh into fpath (if it exists)
if [ -d "$HOME/.zsh" ]; then
    fpath+=($(ls -d $HOME/.zsh/*/))
fi

# enable colors !!
autoload -U colors && colors
PS1="%{$fg[red]%}%n%{$reset_color%}@%{$fg[blue]%}%m %{$fg[yellow]%}%~ %{$reset_color%}%%"

# prompt
autoload -U promptinit; promptinit

# iterate across desired prompts, seeing if any are 
#   installed, and activating them if so
DESIRED_PROMPTS_ORDER=(purer pure)
PROMPTS=$(prompt -l | sed -n 2p)
for p in $DESIRED_PROMPTS_ORDER; do
    if [[ "${PROMPTS[*]}" == *"$p"* ]]; then
        prompt $p
        break
    fi
done

export PURE_PROMPT_PATH_FORMATTING="%c"		# <- default value btw

# === aliases =================================
alias ls='ls --color=auto'
alias q='exit'
alias c='clear'
alias tty-clock='tty-clock -c -C 1'
alias unimatrix='unimatrix -c red -l o -s 94'
alias yippee='yay'
alias starwars="telnet towel.blinkenlights.nl"
alias md='mkdir'
alias mdp='mkdir -p'
alias sizeof='du -sh'
alias nv='nvim'
alias untargz="tar -xzvf"
alias untar="tar -xvf"
alias lsimg='lsix'

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
ZSH_SYNTAX_HIGHLIGHT_FILE="/usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"
if [ -f "$ZSH_SYNTAX_HIGHLIGHT_FILE" ]; then
    source "$ZSH_SYNTAX_HIGHLIGHT_FILE"
fi

# git extras autocomplete
GIT_EXTRAS_FILE="/usr/share/doc/git-extras/git-extras-completion.zsh"
if [ -f "$GIT_EXTRAS_FILE" ]; then
	source "$GIT_EXTRAS_FILE"
fi

