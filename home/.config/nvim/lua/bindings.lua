-- inspired by:
--   https://github.com/phukon/nvim-config/blob/main/lua/core/mappings.lua

-- possible vim modes: n, v, i, t

local BINDS = {
    -- insert mode binds
    i = {
        ["<C-BS>"] = { "<ESC>dbi", "delete one word back" },
        ["<C-Del>"] = { "<ESC>dwi", "delete one word forward" },
    },

    -- normal mode binds
    n = {
        ["<C-j>"] = { ":belowright split term://zsh <ENTER> A", "open new split terminal" },
        ["<C-b>"] = { ":Lexplore<ENTER>", "toggles file browser on left window" },
        ["<M-z>"] = { ":set wrap! <ENTER>", "toggle line wrapping" },
        ["<C-S-i>"] = {
            -- insane fucking bind to format indents and remove trailing spaces
            ("maggVG=`a" ..
            -- https://vi.stackexchange.com/questions/454/whats-the-simplest-way-to-strip-trailing-whitespace-from-all-lines-in-a-file
            ":let _s=@/<Bar>:%s/\\s\\+$//e<Bar>:let @/=_s<Bar><ENTER>"),
            "format file indentations & spaces"
        },
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

