-- netrw config suggestions from:
--   https://vonheikemen.github.io/devlog/tools/using-netrw-vim-builtin-file-explorer/
--
-- more cool config stuff:
--   https://kitsugo.com/guide/netrw-improvements/

-- make sure nvim starts in specified second arg dir
--   (good for emulating a "working dir" from our shell)
ARGS = vim.fn.argv()
if ARGS[1] ~= nil and ARGS[1]:sub(-#"/") == "/" then
	vim.cmd(":cd %:h")
end

require("netrw").setup({
    use_devicons = true,
    mappings = {
        -- toss some mappings in here
    },
})

local g = vim.g

-- mostly grabbed from: https://kitsugo.com/guide/netrw-improvements/
g.netrw_banner = 0          -- Hide the useless Netrw banner at the top
g.netrw_altv = 1            -- Create the Netrw window to the left
-- g.netrw_browse_split = 4    -- Open files in the left-side window. This emulates the typical "drawer" behavior
g.netrw_liststyle = 4       -- Show all files in one directory as one column
g.netrw_winsize = 26        -- Set the width of the Netrw window, making it a "sidebar"
g.netrw_chgwin = 1          -- Ensure that when closing Netrw, our cursor is always placed in the leftmost window
g.netrw_clipboard = 0       -- Prevent Netrw from messing with the clipboard
g.netrw_fastbrowse = 2      -- Fixes some weird behavior
g.netrw_localcopydircmd = "cp -r" -- enable recursive copying
g.netrw_keepdir = 0         -- ensure dir matches when copying things

