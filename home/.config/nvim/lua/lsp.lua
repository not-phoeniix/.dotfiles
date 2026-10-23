-- https://blog.viktomas.com/graph/neovim-native-built-in-lsp-autocomplete/
local function on_attach(client, bufnr)
    vim.lsp.completion.enable(true, client.id, bufnr, {
        autotrigger = true,
        convert = function(item)
            return { abbr = item.label:gsub("%b()", "") }
        end,
    })
    vim.keymap.set("i", "<C-space>", vim.lsp.completion.get, { desc = "trigger autocompletion" })
end

local function try_enable_lsp(lsp_name)
    if not vim.lsp.is_enabled(lsp_name) then
        vim.lsp.enable(lsp_name)
        vim.lsp.config(lsp_name, { on_attach })
    end
end

-- specific LSPs:
try_enable_lsp("clangd")
try_enable_lsp("jsonls")
try_enable_lsp("lua_ls")
try_enable_lsp("tsserver")

-- enable inline diagnostic stuff
vim.diagnostic.enable = true
vim.diagnostic.config({ virtual_lines = true })
vim.cmd("set completeopt+=noselect")

