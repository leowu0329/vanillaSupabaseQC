// config/env.config.js
// 步驟 1：在專案中建立一個安全的範本檔
// 請在專案的 config/ 資料夾下，新增一個名為 env.config.template.js 的檔案（這個檔案不要加入 .gitignore，讓它提交到 GitHub/Vercel）：
window.ENV = {
    SUPABASE_URL: "V_SUPABASE_URL",
    SUPABASE_ANON_KEY: "V_SUPABASE_ANON_KEY"
};

// 步驟 2：修改 IPQCpage.html 的引入路徑
// 將 IPQCpage.html 中原本引入 env.config.js 的那一行，改為引入我們新建立的範本檔：
//<script src="config/env.config.template.js"></script>