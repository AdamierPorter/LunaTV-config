const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'report.md');
const readmePath = path.join(__dirname, 'README.md');

// 读取 report.md
if (!fs.existsSync(reportPath)) {
  console.error('report.md 不存在，请先运行 check_apis.js');
  process.exit(1);
}

const reportContent = fs.readFileSync(reportPath, 'utf-8');

// 提取 Markdown 表格
const tableMatch = reportContent.match(/\| 状态 \|[\s\S]+?\| \d+ \|/);
if (!tableMatch) {
  console.error('report.md 中未找到表格');
  process.exit(1);
}
const tableMd = tableMatch[0];

// 更新 README.md
let readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : "";

// 替换标记中的内容
const newReadme = readmeContent.replace(
  /<!-- API_TABLE_START -->[\s\S]*?<!-- API_TABLE_END -->/,
  `<!-- API_TABLE_START -->\n${tableMd}\n<!-- API_TABLE_END -->`
);

fs.writeFileSync(readmePath, newReadme, 'utf-8');
console.log('README.md 已更新表格');
