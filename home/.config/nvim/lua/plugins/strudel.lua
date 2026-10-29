vim.pack.add({ "https://github.com/gruvw/strudel.nvim" })

require("strudel").setup({
    update_on_save = true,
    browser_exec_path = "/usr/bin/chromium",
    headless = true,
})

