" === auto loading/installing ===================

" Install vim-plug if not found
if empty(glob('~/.local/share/nvim/site/autoload/plug.vim'))
	silent !curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs
		\ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
endif

" Run PlugInstall if there are missing plugins
autocmd VimEnter * if len(filter(values(g:plugs), '!isdirectory(v:val.dir)'))
  	\| PlugInstall --sync | source $MYVIMRC
\| endif

" === PLUGINS ===================================

call plug#begin()

" lsp shit
Plug 'williamboman/mason.nvim', { 'do': ':MasonUpdate' }
Plug 'williamboman/mason-lspconfig.nvim'
Plug 'neovim/nvim-lspconfig'

" editing help
Plug 'nvim-treesitter/nvim-treesitter', {'do': ':TSUpdate'}  

" ui
Plug 'nvim-tree/nvim-web-devicons'
Plug 'nvim-tree/nvim-tree.lua'
Plug 'nvim-lualine/lualine.nvim'
Plug 'romgrk/barbar.nvim'
Plug 'nvimdev/dashboard-nvim'

" other visual
Plug 'lunarvim/horizon.nvim'
Plug 'lukas-reineke/indent-blankline.nvim'
Plug 'RRethy/vim-illuminate'

" nvim completion shit
"Plug 'hrsh7th/cmp-nvim-lsp'
"Plug 'hrsh7th/cmp-buffer'
"Plug 'hrsh7th/cmp-path'
"Plug 'hrsh7th/cmp-cmdline'
"Plug 'hrsh7th/nvim-cmp'

" snippy...?
"Plug 'dcampos/nvim-snippy'
"Plug 'dcampos/cmp-snippy'

call plug#end()

" === config shit ===============================

" prefs
set ts=4
set sw=4
set number
colorscheme horizon
hi Normal guibg=NONE ctermbg=NONE	" allows transparent bg
set mouse+=a

let g:indent_blankline_filetype_exclude = ['dashboard']

" setup for treesitter
lua require'nvim-treesitter.configs'.setup{highlight={enable=true}}

" lua setups :]
lua require('config')
