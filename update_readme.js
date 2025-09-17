const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'report.md');
const readmePath = path.join(__dirname, 'README.md');

// 读取 report.md
if (!fs.existsSync(reportPath)) {
  console.error('❌ report.md 不存在，请先运行 check_apis.js');
  process.exit(1);
}

const reportContent = fs.readFileSync(reportPath, 'utf-8');

// 提取 Markdown 表格
const tableMatch = reportContent.match(/\| 状态 \|[\s\S]+?\n\n/);
if (!tableMatch) {
  console.error('❌ report.md 中未找到表格');
  process.exit(1);
}
const tableMd = tableMatch[0].trim();

// 获取当前 CST 时间
const now = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 16) + " CST";

// 生成带时间戳的区块
const tableBlock = `## API 状态（最近更新：${now}）\n\n<!-- API_TABLE_START -->\n${tableMd}\n<!-- API_TABLE_END -->`;

// 读取 README.md（可能不存在）
let readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : "";

// 替换或追加
if (readmeContent.includes("<!-- API_TABLE_START -->") && readmeContent.includes("<!-- API_TABLE_END -->")) {
  // 替换已有内容
  readmeContent = readmeContent.replace(
    /## API 状态（最近更新：[^\n]+）[\s\S]*?<!-- API_TABLE_END -->/,
    tableBlock
  );
  console.log("✅ README.md 已更新 API 状态表格（带时间戳）");
} else {
  // 如果没有标记，就在文件末尾追加
  readmeContent += `\n\n${tableBlock}\n`;
  console.log("⚠️ README.md 未找到标记，已自动追加 API 状态表格到末尾");
}

// 写回文件
fs.writeFileSync(readmePath, readmeContent, 'utf-8');
