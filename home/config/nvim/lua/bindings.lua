-- inspired by:
--   https://github.com/phukon/nvim-config/blob/main/lua/core/mappings.lua

-- possible vim modes: n, v, i, t

vim.g.mapleader = "\\"

local BINDS = {
    -- insert mode binds
    i = {
        ["<C-BS>"] = { "<ESC>ldbi", "delete one word back" },
        ["<C-Del>"] = { "<ESC>ldwi", "delete one word forward" },
    },

    -- normal mode binds
    n = {
        ["<C-j>"] = { ":belowright split term://zsh <ENTER> A", "open new split terminal" },
        ["<C-b>"] = { ":Lex<ENTER>", "toggles file browser on left window" },
        ["<M-z>"] = { ":set wrap! <ENTER>", "toggle line wrapping" },
        ["<C-S-i>"] = { ":lua require('conform').format() <ENTER>" },
    },
}

for mode, binds in pairs(BINDS) do
    for keystroke, bind_desc in pairs(binds) do
        vim.keymap.set(
            mode,
            keystroke,
            bind_desc[1],
            { desc = bind_desc[2] }
        )
    end
end

