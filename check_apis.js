// check_apis_v3.js
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const configPath = path.join(__dirname, 'LunaTV-config.json');
const reportPath = path.join(__dirname, 'report.md');
const MAX_DAYS = 100;
const WARN_STREAK = 3;

// === 读取配置 ===
if (!fs.existsSync(configPath)) {
  console.error("❌ 配置文件不存在:", configPath);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const apiEntries = Object.values(config.api_site).map(site => ({
  name: site.name,
  api: site.api,
  detail: site.detail || "-"
}));

// === 当前 CST 时间 ===
const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
  .toISOString().replace("T", " ").slice(0, 16) + " CST";

// === 读取历史数据 ===
let history = [];
if (fs.existsSync(reportPath)) {
  const oldReport = fs.readFileSync(reportPath, 'utf-8');
  const match = oldReport.match(/```json\n([\s\S]+?)\n```/);
  if (match) {
    try { history = JSON.parse(match[1]); } catch {}
  }
}

// === 检查重复 API ===
const apiCountMap = {};
for (const { api } of apiEntries) {
  apiCountMap[api] = (apiCountMap[api] || 0) + 1;
}

// === 执行检测（并发）===
(async () => {
  console.log("⏳ 正在检测 API 可用性...");

  const results = await Promise.allSettled(
    apiEntries.map(({ name, api }) =>
      axios.get(api, { timeout: 10000 })
        .then(res => ({ name, api, success: res.status === 200 }))
        .catch(() => ({ name, api, success: false }))
    )
  );
  const todayResults = results.map(r => r.value || r.reason);

  // === 更新历史 ===
  history.push({ date: new Date().toISOString().slice(0,10), results: todayResults });
  if (history.length > MAX_DAYS) history = history.slice(-MAX_DAYS);

  // === 统计 ===
  const stats = {};
  for (const { name, api, detail } of apiEntries) {
    stats[api] = { name, api, detail, ok: 0, fail: 0, fail_streak: 0, trend: "", status: "❌", duplicate: apiCountMap[api] > 1 };

    // 统计成功/失败次数
    for (const day of history) {
      const record = day.results.find(x => x.api === api);
      if (!record) continue;
      if (record.success) stats[api].ok++; else stats[api].fail++;
    }

    // === 连续失败统计（反向） ===
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const record = history[i].results.find(x => x.api === api);
      if (!record) continue;
      if (record.success) break;
      streak++;
    }
    stats[api].fail_streak = streak;

    // === 最近7天趋势 ===
    const recent = history.slice(-7);
    stats[api].trend = recent.map(day => {
      const r = day.results.find(x => x.api === api);
      return r ? (r.success ? "✅" : "❌") : "-";
    }).join('');

    // === 状态判断 ===
    const latest = todayResults.find(x => x.api === api);
    if (stats[api].duplicate) stats[api].status = "🔁";
    else if (streak >= WARN_STREAK) stats[api].status = "🚨";
    else if (latest?.success) stats[api].status = "✅";
  }

  // === 汇总统计 ===
  const totalAPIs = apiEntries.length;
  const duplicateAPIs = Object.values(apiCountMap).filter(c => c > 1).length;

  console.log(`✅ 检测完成：${totalAPIs} 个 API（重复 ${duplicateAPIs}）`);

  // === 排序：异常优先 ===
  const sorted = Object.values(stats).sort((a, b) => {
    const order = { "🚨": 1, "❌": 2, "🔁": 3, "✅": 4 };
    return order[a.status] - order[b.status];
  });

  // === 生成报告 ===
  let md = `# API 健康检查报告\n\n`;
  md += `最近更新：${now}\n\n`;
  md += `**总 API 数量:** ${totalAPIs}  |  **重复 API 数量:** ${duplicateAPIs}\n\n`;
  md += `## 最近 ${MAX_DAYS} 次 API 健康统计\n\n`;
  md += "| 状态 | 名称 | 地址 | API | 成功次数 | 失败次数 | 可用率 | 连续失败 | 最近7天趋势 |\n";
  md += "|------|------|-----|-----|----------:|----------:|--------:|-----------:|--------------|\n";

  for (const s of sorted) {
    const total = s.ok + s.fail;
    const rate = total > 0 ? ((s.ok / total) * 100).toFixed(1) + "%" : "-";
    const shortUrl = s.api.length > 30 ? s.api.slice(0, 57) + "..." : s.api;
    const detailLink = s.detail.startsWith('http')
      ? `[🔗](${s.detail})`
      : s.detail;
    md += `| ${s.status} | ${s.name} | ${detailLink} | ${shortUrl} | ${s.ok} | ${s.fail} | ${rate} | ${s.fail_streak} | ${s.trend} |\n`;
  }

  md += `\n## 详细历史数据 (JSON)\n`;
  md += "```json\n" + JSON.stringify(history, null, 2) + "\n```\n";

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log("📄 报告已生成:", reportPath);
})();
