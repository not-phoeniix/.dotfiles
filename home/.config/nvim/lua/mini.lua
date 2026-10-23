-- config for all the mini.nvim components
--   (https://nvim-mini.org/)

require("mini.icons").setup()
require("mini.comment").setup({
    mappings = {
        comment = "<C-/>",
        comment_line = "<C-/>",
        comment_visual = "<C-/>",
        textobject = "<C-/>",
    },
})

