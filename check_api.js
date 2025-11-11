// check_sources.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { URL } = require("url");

// === 配置 ===
const CONFIG_PATH = path.join(__dirname, "LunaTV-config.json");
const REPORT_PATH = path.join(__dirname, "report.md");
const MAX_DAYS = 60;
const WARN_STREAK = 3;
const ENABLE_SEARCH_TEST = true; // 是否启用搜索功能检测
const SEARCH_KEYWORD = process.argv[2] || "斗罗大陆";
const TIMEOUT_MS = 10000;

// === 加载配置 ===
if (!fs.existsSync(CONFIG_PATH)) {
  console.error("❌ 配置文件不存在:", CONFIG_PATH);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
const apiEntries = Object.values(config.api_site).map((s) => ({
  name: s.name,
  api: s.api,
  detail: s.detail || "-",
  disabled: !!s.disabled,
}));

// === 读取历史记录 ===
let history = [];
if (fs.existsSync(REPORT_PATH)) {
  const old = fs.readFileSync(REPORT_PATH, "utf-8");
  const match = old.match(/```json\n([\s\S]+?)\n```/);
  if (match) {
    try {
      history = JSON.parse(match[1]);
    } catch {}
  }
}

// === 当前 CST 时间 ===
const now = new Date(Date.now() + 8 * 60 * 60 * 1000)
  .toISOString()
  .replace("T", " ")
  .slice(0, 16) + " CST";

// === 工具函数 ===
const safeGet = async (url) => {
  try {
    const res = await axios.get(url, { timeout: TIMEOUT_MS });
    return res.status === 200;
  } catch {
    return false;
  }
};

// 搜索检测函数，返回四种状态
const testSearch = async (api, keyword) => {
  try {
    const url = `${api}?wd=${encodeURIComponent(keyword)}`;
    const res = await axios.get(url, { timeout: TIMEOUT_MS });
    if (res.status !== 200 || !res.data || typeof res.data !== "object") {
      return "404";
    }
    const list = res.data.list || [];
    if (!list.length) return "无结果";

    const matched = list.some(item => JSON.stringify(item).includes(keyword));
    return matched ? "可用" : "不匹配";
  } catch {
    return "404";
  }
};

// === 主逻辑 ===
(async () => {
  console.log("⏳ 正在检测 API 与搜索功能可用性...");

  const results = await Promise.allSettled(
    apiEntries.map(async ({ name, api, disabled }) => {
      if (disabled) return { name, api, disabled, success: false, searchStatus: "无法搜索" };

      const ok = await safeGet(api);
      const searchStatus = ENABLE_SEARCH_TEST ? await testSearch(api, SEARCH_KEYWORD) : "-";

      return { name, api, disabled, success: ok, searchStatus };
    })
  );

  const todayResults = results.map((r) => r.value || r.reason);
  const todayRecord = {
    date: new Date().toISOString().slice(0, 10),
    keyword: SEARCH_KEYWORD,
    results: todayResults,
  };

  history.push(todayRecord);
  if (history.length > MAX_DAYS) history = history.slice(-MAX_DAYS);

  // === 统计 ===
  const stats = {};
  for (const { name, api, detail, disabled } of apiEntries) {
    stats[api] = {
      name,
      api,
      detail,
      disabled,
      ok: 0,
      fail: 0,
      fail_streak: 0,
      trend: "",
      searchStatus: "-",
      status: "❌",
    };

    // 成功/失败统计
    for (const day of history) {
      const rec = day.results.find((x) => x.api === api);
      if (!rec) continue;
      if (rec.success) stats[api].ok++;
      else stats[api].fail++;
    }

    // 连续失败统计
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const rec = history[i].results.find((x) => x.api === api);
      if (!rec) continue;
      if (rec.success) break;
      streak++;
    }
    const total = stats[api].ok + stats[api].fail;
    stats[api].successRate = total > 0 ? ((stats[api].ok / total) * 100).toFixed(1) + "%" : "-";


    // 最近7天趋势
    const recent = history.slice(-7);
    stats[api].trend = recent
      .map((day) => {
        const r = day.results.find((x) => x.api === api);
        if (!r) return "-";
        return r.success ? "✅" : "❌";
      })
      .join("");

    // 搜索状态（取最新一天结果）
    const latest = todayResults.find((x) => x.api === api);
    if (latest) stats[api].searchStatus = latest.searchStatus;

    // 综合状态
    if (disabled) stats[api].status = "🚫";
    else if (streak >= WARN_STREAK) stats[api].status = "🚨";
    else if (latest?.success) stats[api].status = "✅";
  }

  // === 生成 Markdown 报告 ===
  let md = `# 源接口健康检测报告\n\n`;
  md += `最近更新时间：${now}\n\n`;
  md += `**总源数:** ${apiEntries.length} | **检测关键词:** ${SEARCH_KEYWORD}\n\n`;
  md += "| 状态 | 资源名称 | 地址 | API | 搜索功能 | 成功次数 | 失败次数 | 成功率 | 最近7天趋势 |\n";
  md += "|------|---------|-----|-----|---------|---------:|---------:|------:|--------------|\n";

  const sorted = Object.values(stats).sort((a, b) => {
    const order = { "🚨": 1, "❌": 2, "✅": 3, "🚫": 4 };
    return order[a.status] - order[b.status];
  });

  for (const s of sorted) {
    const total = s.ok + s.fail;
    const rate = total > 0 ? ((s.ok / total) * 100).toFixed(1) + "%" : "-";

    const detailLink = s.detail.startsWith("http") ? `[🔗](${s.detail})` : s.detail;
    const apiLink = `[🔗](${s.api})`;

    md += `| ${s.status} | ${s.name} | ${detailLink} | ${apiLink} | ${s.searchStatus} | ${s.ok} | ${s.fail} | ${s.successRate} | ${s.trend} |\n`;
  }

  md += `\n## 历史检测数据 (JSON)\n`;
  md += "```json\n" + JSON.stringify(history, null, 2) + "\n```\n";

  fs.writeFileSync(REPORT_PATH, md, "utf-8");
  console.log("📄 报告已生成:", REPORT_PATH);
})();
