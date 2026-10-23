local opt = vim.opt
local cmd = vim.cmd

opt.number = true
opt.cmdheight = 0
opt.clipboard="unnamed,unnamedplus"
opt.undofile = true
opt.autoread = true
opt.wrap = false

-- make tabs actually 4 spaces
opt.tabstop = 8
opt.softtabstop = 0
opt.shiftwidth = 4
opt.smarttab = true
opt.expandtab = true

-- make popups display for lsp autocomplete
opt.completeopt = { "menuone", "noselect", "popup" }

-- transparent background
cmd([[highlight Normal guibg=NONE ctermbg=NONE]])

