-- hiiiiii

-- don't load plugins in vscode instances
if not vim.g.vscode then
    require "plugins"
end

require "config"
require "lsp"
require "bindings"

