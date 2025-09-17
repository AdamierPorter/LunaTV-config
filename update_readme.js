//  update_readme.js
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
let tableMd = tableMatch[0].trim();

// 拆分表格行
const lines = tableMd.split('\n');
const header = lines.slice(0, 2); // 表头部分
const rows = lines.slice(2); // 数据部分

// 提取 API 地址列
const apiAddresses = rows.map(line => line.split('|')[3].trim());

// 统计
const totalApis = apiAddresses.length;
const apiCounts = apiAddresses.reduce((acc, api) => {
  acc[api] = (acc[api] || 0) + 1;
  return acc;
}, {});
const duplicateApis = Object.values(apiCounts).filter(v => v > 1).length;

// 成功与失败数量（看状态列 ✅ ❌ 🚨）
let successApis = 0;
let failApis = 0;
const updatedRows = rows.map(line => {
  const cols = line.split('|').map(c => c.trim());
  const status = cols[1]; // 状态列
  const api = cols[3];

  if (status.includes('✅')) {
    successApis++;
  } else {
    failApis++;
    // 高亮失败行：在状态后加 🚩 标记
    cols[1] = `${status} 🚩`;
  }
  return `| ${cols.slice(1).join(' | ')} |`;
});

// 更新表格
tableMd = [...header, ...updatedRows].join('\n');

// 获取当前 CST 时间
const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
  .toISOString()
  .replace("T", " ")
  .slice(0, 16) + " CST";

// 生成带统计和时间戳的区块
const tableBlock =
  `## API 状态（最近更新：${now}）\n\n` +
  `- 总 API 数量：${totalApis}\n` +
  `- 成功 API 数量：${successApis}\n` +
  `- 失败 API 数量：${failApis}\n` +
  `- 重复 API 数量：${duplicateApis}\n\n` +
  `<!-- API_TABLE_START -->\n${tableMd}\n<!-- API_TABLE_END -->`;

// 读取 README.md（可能不存在）
let readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : "";

// 替换或追加
if (readmeContent.includes("<!-- API_TABLE_START -->") && readmeContent.includes("<!-- API_TABLE_END -->")) {
  readmeContent = readmeContent.replace(
    /## API 状态（最近更新：[^\n]+）[\s\S]*?<!-- API_TABLE_END -->/,
    tableBlock
  );
  console.log("✅ README.md 已更新 API 状态表格（带统计、时间戳和高亮失败标记）");
} else {
  readmeContent += `\n\n${tableBlock}\n`;
  console.log("⚠️ README.md 未找到标记，已自动追加 API 状态表格到末尾");
}

// 写回文件
fs.writeFileSync(readmePath, readmeContent, 'utf-8');
