// update_readme.js
const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'report.md');
const readmePath = path.join(__dirname, 'README.md');

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
let rows = lines.slice(2); // 数据部分

// 提取 API 地址列并统计
const apiStats = {};

rows.forEach(line => {
  const cols = line.split('|').map(c => c.trim());
  const status = cols[1]; // 获取状态列
  const api = cols[3];    // 获取 API 地址列

  // 初始化 API 统计
  if (!apiStats[api]) {
    apiStats[api] = { success: 0, total: 0 };
  }

  apiStats[api].total += 1;
  if (status.includes('✅')) {
    apiStats[api].success += 1;
  }
});

// 计算每个 API 的成功率
let successApis = 0;
let failApis = 0;

const parsedRows = Object.entries(apiStats).map(([api, { success, total }]) => {
  const successRate = success / total;  // 可用率
  successApis += success;
  failApis += (total - success);

  return {
    api,
    success,
    total,
    successRate
  };
});

// 🔥 按可用率排序（成功的排前面，失败的排后面）
parsedRows.sort((a, b) => b.successRate - a.successRate);

// 拼接排序后的表格行
const updatedRows = parsedRows.map(({ api, success, total }) => {
  // 查找对应的行
  const line = rows.find(row => row.includes(api));
  const cols = line.split('|').map(c => c.trim());
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
  `- 总 API 数量：${Object.keys(apiStats).length}\n` +
  `- 成功 API 数量：${successApis}\n` +
  `- 失败 API 数量：${failApis}\n` +
  `- 重复 API 数量：${Object.keys(apiStats).filter(k => apiStats[k].total > 1).length}\n\n` +
  `<div style="font-size: 11px;">\n\n` +
  `<!-- API_TABLE_START -->\n${tableMd}\n<!-- API_TABLE_END -->`;

// 读取 README.md（可能不存在）
let readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : "";

if (readmeContent.includes("<!-- API_TABLE_START -->") && readmeContent.includes("<!-- API_TABLE_END -->")) {
  readmeContent = readmeContent.replace(
    /## API 状态（最近更新：[^\n]+）[\s\S]*?<!-- API_TABLE_END -->/,
    tableBlock
  );
  console.log("✅ README.md 已更新 API 状态表格（已按可用率排序）");
} else {
  readmeContent += `\n\n${tableBlock}\n`;
  console.log("⚠️ README.md 未找到标记，已自动追加 API 状态表格到末尾（已按可用率排序）");
}

fs.writeFileSync(readmePath, readmeContent, 'utf-8');
