-- hiiiiii

-- package setup
vim.pack.add {
    { src = "https://github.com/neovim/nvim-lspconfig" },
    { src = "https://github.com/nvim-mini/mini.icons" },
    { src = "https://github.com/prichrd/netrw.nvim" },
    { src = 'https://github.com/nvim-mini/mini.comment' },
}

-- sub config files
require "opts"
require "mini"
require "filetree"
require "lsp"
require "bindings"

