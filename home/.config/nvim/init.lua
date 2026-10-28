-- hiiiiii

-- package setup
vim.pack.add {
    { src = "https://github.com/neovim/nvim-lspconfig" },
    { src = "https://github.com/nvim-mini/mini.icons" },
    { src = "https://github.com/prichrd/netrw.nvim" },
    { src = "https://github.com/nvim-mini/mini.comment" },
    { src = "https://github.com/stevearc/conform.nvim" },
    { src = "https://github.com/gruvw/strudel.nvim" },
}

-- sub config files
require "opts"
require "mini"
require "filetree"
require "formatting"
require "lsp"
require "strudel_setup"
require "bindings"

