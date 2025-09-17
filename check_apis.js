const fs = require('fs');
const axios = require('axios');
const path = require('path');

const configPath = path.join(__dirname, 'luna-tv-config.json');
const reportPath = path.join(__dirname, 'report.md');
const MAX_DAYS = 30;
const WARN_STREAK = 3; // 连续失败天数阈值

// 读取 API 配置
const rawData = fs.readFileSync(configPath);
const config = JSON.parse(rawData);
const apis = Object.values(config.api_site).map(site => site.api);

// 读取历史记录
let history = [];
if (fs.existsSync(reportPath)) {
  const oldReport = fs.readFileSync(reportPath, 'utf-8');
  const match = oldReport.match(/```json\n([\s\S]+?)\n```/);
  if (match) history = JSON.parse(match[1]);
}

(async () => {
  const todayResults = [];

  for (const api of apis) {
    try {
      const res = await axios.get(api, { timeout: 10000 });
      todayResults.push({ api, success: res.status === 200 });
    } catch (e) {
      todayResults.push({ api, success: false });
    }
  }

  // 更新历史
  history.push({ date: new Date().toISOString().slice(0,10), results: todayResults });
  if (history.length > MAX_DAYS) history = history.slice(-MAX_DAYS);

  // 统计每个 API 的成功/失败次数和连续失败天数
  const stats = {};
  const apiList = apis;
  for (const api of apiList) {
    stats[api] = { ok: 0, fail: 0, fail_streak: 0 };
    let streak = 0;
    for (const day of history) {
      const r = day.results.find(x => x.api === api);
      if (r?.success) {
        stats[api].ok++;
        streak = 0;
      } else {
        stats[api].fail++;
        streak++;
      }
      stats[api].fail_streak = streak;
    }
  }

  // 生成 Markdown 报告
  let md = `# API Health Check Report\n\n`;
  md += `## 最近 ${MAX_DAYS} 天 API 健康统计\n\n`;
  md += "| API | 成功次数 | 失败次数 | 可用率 | 连续失败天数 |\n";
  md += "|-----|---------:|---------:|-------:|-------------:|\n";

  for (const api of apiList) {
    const s = stats[api];
    const total = s.ok + s.fail;
    const rate = total > 0 ? ((s.ok/total)*100).toFixed(1) + "%" : "-";
    const warn = s.fail_streak >= WARN_STREAK ? "🚨 " : "";
    md += `| ${warn}${api} | ${s.ok} | ${s.fail} | ${rate} | ${s.fail_streak} |\n`;
  }

  md += `\n## 详细历史数据 (JSON)\n`;
  md += "```json\n" + JSON.stringify(history, null, 2) + "\n```\n";

  fs.writeFileSync(reportPath, md, 'utf-8');

})();
