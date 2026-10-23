-- netrw config suggestions from:
--   https://vonheikemen.github.io/devlog/tools/using-netrw-vim-builtin-file-explorer/

require("netrw").setup()

local g = vim.g

g.netrw_liststyle = 3
g.netrw_winsize = 30
g.netrw_banner = 0
g.netrw_browse_split = 0
g.netrw_keepdir = 0
-- enable recusive copying
g.netrw_localcopydircmd = "cp -r"

