-- misc plugins that don't have their own files
vim.pack.add {
    { src = "https://github.com/neovim/nvim-lspconfig" },
}

require "plugins.mini"
require "plugins.netrw"
require "plugins.conform"
require "plugins.strudel"
require "plugins.nvim-highlight-colors"

