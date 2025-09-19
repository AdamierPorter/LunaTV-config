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

// 统计每个 API 的成功率
const apiStats = {};
const rowsWithData = [];

rows.forEach(line => {
    const cols = line.split('|').map(c => c.trim());
    const status = cols[1]; // 状态列
    const api = cols[3]; // API 地址列
    
    if (!apiStats[api]) {
        apiStats[api] = { total: 0, success: 0 };
    }
    
    apiStats[api].total++;
    if (status.includes('✅')) {
        apiStats[api].success++;
    }
    
    // 计算当前行的可用率
    const successRate = (apiStats[api].success / apiStats[api].total * 100);
    
    rowsWithData.push({
        line: line,
        cols: cols,
        api: api,
        successRate: successRate, // 保持为数字类型
        isSuccess: status.includes('✅')
    });
});

// 按照可用率排序（从高到低） - 修正排序逻辑
rowsWithData.sort((a, b) => {
    // 首先按可用率降序排列（数值比较）
    if (b.successRate !== a.successRate) {
        return b.successRate - a.successRate;
    }
    // 可用率相同时按API名称升序排列
    return a.api.localeCompare(b.api);
});

// 生成排序后的表格行
const sortedRows = rowsWithData.map(row => {
    return `| ${row.cols.slice(1).join(' | ')} |`;
});

// 更新表格
tableMd = [...header, ...sortedRows].join('\n');

// 总体统计
const totalApis = Object.keys(apiStats).length;
const totalTests = rowsWithData.length;
const successTests = rowsWithData.filter(row => row.isSuccess).length;
const failTests = totalTests - successTests;

// 计算平均可用率
const overallSuccessRate = totalTests > 0 ? (successTests / totalTests * 100).toFixed(1) : 0;

// 统计不同可用率区间的API数量
const highAvailability = Object.values(apiStats).filter(stat => (stat.success / stat.total) >= 0.8).length;
const mediumAvailability = Object.values(apiStats).filter(stat => {
    const rate = stat.success / stat.total;
    return rate >= 0.5 && rate < 0.8;
}).length;
const lowAvailability = Object.values(apiStats).filter(stat => (stat.success / stat.total) < 0.5).length;

// 获取当前 CST 时间
const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16) + " CST";

// 生成带统计和时间戳的区块
const tableBlock =
    `## API 状态（最近更新：${now}）\n\n` +
    `- 总 API 数量：${totalApis}\n` +
    `- 总测试次数：${totalTests}\n` +
    `- 成功测试数：${successTests}\n` +
    `- 失败测试数：${failTests}\n` +
    `- 整体可用率：${overallSuccessRate}%\n` +
    `- 高可用率 API（≥80%）：${highAvailability} 个\n` +
    `- 中等可用率 API（50%-79%）：${mediumAvailability} 个\n` +
    `- 低可用率 API（<50%）：${lowAvailability} 个\n\n` +
    `<div style="font-size: 11px;">\n\n` +
    `<!-- API_TABLE_START -->\n${tableMd}\n<!-- API_TABLE_END -->`;

// 读取 README.md（可能不存在）
let readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : "";

// 替换或追加
if (readmeContent.includes("<!-- API_TABLE_START -->") && readmeContent.includes("<!-- API_TABLE_END -->")) {
    readmeContent = readmeContent.replace(
        /## API 状态（最近更新：[^\n]+）[\s\S]*?<!-- API_TABLE_END -->/,
        tableBlock
    );
    console.log("✅ README.md 已更新 API 状态表格（按可用率排序，带详细统计）");
} else {
    readmeContent += `\n\n${tableBlock}\n`;
    console.log("⚠️ README.md 未找到标记，已自动追加 API 状态表格到末尾");
}

// 写回文件
fs.writeFileSync(readmePath, readmeContent, 'utf-8');

// 输出排序结果摘要和调试信息
console.log(`\n📊 统计摘要：`);
console.log(`- 整体可用率：${overallSuccessRate}%`);
console.log(`- 高可用率 API：${highAvailability} 个`);
console.log(`- 中等可用率 API：${mediumAvailability} 个`);
console.log(`- 低可用率 API：${lowAvailability} 个`);

// 调试信息：显示排序后的前5个API
console.log(`\n🔍 排序结果（前5个）：`);
rowsWithData.slice(0, 5).forEach((row, index) => {
    console.log(`${index + 1}. ${row.api}: ${row.successRate.toFixed(1)}%`);
});
