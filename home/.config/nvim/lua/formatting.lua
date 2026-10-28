require("conform").setup({
    formatters_by_ft = {
        cpp = { "clang-format", lsp_format = "fallback" },
        javascript = { "prettier" },
        typescript = { "prettier" },

        -- fallback for all other filetypes
        ["*"] = { "trim_whitespace" },
    }
})

vim.o.formatexpr = "v:lua.require'conform'.formatexpr()"

