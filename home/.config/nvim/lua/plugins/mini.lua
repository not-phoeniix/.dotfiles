-- config for all the mini.nvim components
--   (https://nvim-mini.org/)

vim.pack.add({
    { src = "https://github.com/nvim-mini/mini.icons" },
    { src = "https://github.com/nvim-mini/mini.comment" },
})

require("mini.icons").setup()
require("mini.comment").setup({
    mappings = {
        comment = "<C-/>",
        comment_line = "<C-/>",
        comment_visual = "<C-/>",
        textobject = "<C-/>",
    },
})

