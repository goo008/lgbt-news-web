/*
  LGBT 每日新闻订阅 - 纯前端聚合器
  说明：为避免跨域限制，默认通过代理抓取 RSS，并在多个代理之间自动回退。
*/

const DEFAULT_SOURCES = [
  // 英文主流 LGBT 媒体
  { id: 'pinknews', name: 'PinkNews', url: 'https://www.pinknews.co.uk/feed/' },
  { id: 'lgbtqnation', name: 'LGBTQ Nation', url: 'https://www.lgbtqnation.com/feed/' },
  { id: 'guardian-lgbt', name: 'The Guardian - LGBT rights', url: 'https://www.theguardian.com/world/lgbt-rights/rss' },
  { id: 'them-us', name: 'them.us (尝试)', url: 'https://www.them.us/feeds/all.rss.xml' },
  { id: 'out-mag', name: 'OUT (尝试)', url: 'https://www.out.com/rss.xml' },
  // Google 新闻（中文简体）
  { id: 'gnews-zh-cn', name: 'Google 新闻（中文-综合）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20%E5%8F%98%E6%80%A7%20OR%20%E6%80%A7%E5%B0%91%E6%95%B0%29%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  // Google 新闻（中文繁体-台湾）
  { id: 'gnews-zh-tw', name: 'Google 新聞（繁體-綜合）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%88%80%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%A5%20OR%20%E8%AE%8A%E6%80%A7%20OR%20%E6%80%A7%E5%B0%91%E6%95%B8%29%20when%3A7d&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant' },
  // Google News（英文关键词）
  { id: 'gnews-en', name: 'Google News (EN - LGBT/Gay)', url: 'https://news.google.com/rss/search?q=%28gay%20OR%20homosexual%20OR%20LGBT%20OR%20LGBTQ%20OR%20transgender%20OR%20nonbinary%20OR%20queer%29%20when%3A7d&hl=en-US&gl=US&ceid=US%3Aen' },
  // Google 新闻 - 平台定向（中文）
  { id: 'gnews-weixin', name: 'Google 新闻（微信公众号）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20site%3Aweixin.qq.com%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-toutiao', name: 'Google 新闻（今日头条）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20site%3Atoutiao.com%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-baidu', name: 'Google 新闻（百度/百家号）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20%28site%3Abaidu.com%20OR%20site%3Abaijiahao.baidu.com%29%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-douyin', name: 'Google 新闻（抖音）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20site%3Adouyin.com%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  // X(Twitter) 通过 Nitter 搜索 RSS（不稳定，仅作补充）
  { id: 'nitter-net', name: 'X 搜索（nitter.net）', url: 'https://nitter.net/search/rss?f=tweets&q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20gay%29' },
  { id: 'nitter-privacydev', name: 'X 搜索（privacydev）', url: 'https://nitter.privacydev.net/search/rss?f=tweets&q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20gay%29' },
  { id: 'nitter-poast', name: 'X 搜索（poast）', url: 'https://nitter.poast.org/search/rss?f=tweets&q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20gay%29' },
];

// 关键词权重（用于热度分）
const KEYWORD_WEIGHTS = [
  { kw: '同志', w: 10 },
  { kw: '同性恋', w: 10 },
  { kw: '同性戀', w: 10 },
  { kw: '跨性别', w: 10 },
  { kw: '跨性別', w: 10 },
  { kw: '变性', w: 8 },
  { kw: '變性', w: 8 },
  { kw: '性少数', w: 8 },
  { kw: '性少數', w: 8 },
  { kw: 'LGBTQ', w: 12 },
  { kw: 'LGBT', w: 12 },
  { kw: 'gay', w: 9 },
  { kw: 'lesbian', w: 6 },
  { kw: 'bisexual', w: 5 },
  { kw: 'transgender', w: 10 },
  { kw: 'nonbinary', w: 6 },
  { kw: 'queer', w: 6 },
];

// 来源权重（重要媒体略微加权）
const SOURCE_WEIGHTS = {
  'pinknews': 1.15,
  'lgbtqnation': 1.1,
  'guardian-lgbt': 1.1,
  'them-us': 1.05,
  'out-mag': 1.05,
  'gnews-zh-cn': 1.0,
  'gnews-zh-tw': 1.0,
  'gnews-en': 1.0,
  'gnews-weixin': 1.0,
  'gnews-toutiao': 1.0,
  'gnews-baidu': 1.0,
  'gnews-douyin': 0.95,
  'nitter-net': 0.9,
  'nitter-privacydev': 0.9,
  'nitter-poast': 0.9,
};

const state = {
  sources: [...DEFAULT_SOURCES],
  items: [],
  filteredItems: [],
};

const els = {
  sourceSelect: document.getElementById('sourceSelect'),
  keywordInput: document.getElementById('keywordInput'),
  timeWindow: document.getElementById('timeWindow'),
  refreshBtn: document.getElementById('refreshBtn'),
  copyBtn: document.getElementById('copyBtn'),
  exportBtn: document.getElementById('exportBtn'),
  statusText: document.getElementById('statusText'),
  newsList: document.getElementById('newsList'),
  sampleBtn: document.getElementById('sampleBtn'),
  diagBtn: document.getElementById('diagBtn'),
  logView: document.getElementById('logView'),
};

function setStatus(text) {
  els.statusText.textContent = text;
}

function log(...args) {
  const line = args.map(a => typeof a === 'string' ? a : (() => { try { return JSON.stringify(a); } catch { return String(a); } })()).join(' ');
  if (els.logView) {
    els.logView.textContent += `\n${new Date().toISOString()} ${line}`;
  }
  console.log('[LOG]', ...args);
}

// 多重代理回退
const PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://cors.isomorphic-git.org/${u}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
  // 将 https://example.com 规范化为 https://r.jina.ai/http://example.com
  (u) => `https://r.jina.ai/http://${u.replace(/^https?:\/\//, '')}`,
];

function withTimeout(promise, ms = 12000, label = 'timeout') {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => (timer = setTimeout(() => reject(new Error(label)), ms))),
  ]);
}

async function fetchRssRaw(url) {
  let lastErr = null;
  for (let i = 0; i < PROXIES.length; i++) {
    const proxied = PROXIES[i](url);
    try {
      log('fetch', proxied);
      const res = await withTimeout(fetch(proxied, { cache: 'no-store' }), 12000, '请求超时');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text || text.length < 16) throw new Error('空响应');
      if (i > 0) setStatus(`代理已自动切换（#${i + 1}）`);
      return text;
    } catch (e) {
      lastErr = e;
      log('代理失败，尝试下一个', proxied, String(e));
    }
  }
  throw lastErr || new Error('代理全部失败');
}

async function loadFromMirror() {
  try {
    const res = await fetch('./data/news.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        state.items = sortByDateDesc(deduplicate(data.items));
        setStatus('已从镜像数据加载');
        return true;
      }
    }
  } catch (e) {
    log('镜像数据加载失败', String(e));
  }
  try {
    const res2 = await fetch('./data/news.sample.json', { cache: 'no-store' });
    if (res2.ok) {
      const data2 = await res2.json();
      if (Array.isArray(data2.items)) {
        state.items = sortByDateDesc(deduplicate(data2.items));
        setStatus('已加载本地样例数据');
        return true;
      }
    }
  } catch (e) {
    log('样例数据加载失败', String(e));
  }
  return false;
}

function parseDateFlexible(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function parseRssXml(xmlText, source) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const errorNode = xml.querySelector('parsererror');
  if (errorNode) throw new Error('XML 解析失败');

  const items = [];
  const channelItems = Array.from(xml.querySelectorAll('rss channel item'));
  if (channelItems.length > 0) {
    for (const it of channelItems) {
      const title = it.querySelector('title')?.textContent?.trim() || '';
      const link = it.querySelector('link')?.textContent?.trim() || it.querySelector('guid')?.textContent?.trim() || '';
      const pubDateStr = it.querySelector('pubDate')?.textContent?.trim() || '';
      const pubDate = parseDateFlexible(pubDateStr);
      if (!title || !link) continue;
      items.push({
        id: `${source.id}:${link}`,
        title,
        link,
        publishedAt: pubDate ? pubDate.toISOString() : null,
        sourceId: source.id,
        sourceName: source.name,
      });
    }
    return items;
  }

  const entries = Array.from(xml.querySelectorAll('feed entry'));
  for (const it of entries) {
    const title = it.querySelector('title')?.textContent?.trim() || '';
    const linkEl = it.querySelector('link[href]');
    const link = linkEl?.getAttribute('href')?.trim() || '';
    const pubDateStr = it.querySelector('updated')?.textContent?.trim() || it.querySelector('published')?.textContent?.trim() || '';
    const pubDate = parseDateFlexible(pubDateStr);
    if (!title || !link) continue;
    items.push({
      id: `${source.id}:${link}`,
      title,
      link,
      publishedAt: pubDate ? pubDate.toISOString() : null,
      sourceId: source.id,
      sourceName: source.name,
    });
  }
  return items;
}

function deduplicate(items) {
  const map = new Map();
  for (const it of items) {
    const key = it.link || it.title;
    if (!map.has(key)) map.set(key, it);
  }
  return Array.from(map.values());
}

function sortByDateDesc(items) {
  return items.slice().sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });
}

function normalizeTitleForTopicKey(rawTitle) {
  if (!rawTitle) return '';
  let t = rawTitle.toLowerCase();
  t = t.replace(/[\u3000\s\t\r\n]+/g, ' ');
  t = t.replace(/[.,!?:;"'“”‘’()\[\]{}<>@#/$%^&*_=+|\\\-—·、，。！？：；（）【】《》]/g, ' ');
  const stop = new Set(['the','a','an','and','or','of','in','on','with','for','to','by','from','is','are','be','as','at','that','this','it','its','was','were','has','had','have','not','but','也','和','及','与','在','對','对','是','的','了','與','及','或']);
  t = t.split(' ').filter(s => s && !stop.has(s)).join(' ');
  return t.slice(0, 120);
}

function computeKeywordScore(title) {
  if (!title) return 0;
  const t = title.toLowerCase();
  let score = 0;
  for (const { kw, w } of KEYWORD_WEIGHTS) {
    if (t.includes(kw.toLowerCase())) score += w;
  }
  return Math.min(score, 30);
}

function computeRecencyScore(iso) {
  if (!iso) return 0;
  const ageMs = Date.now() - new Date(iso).getTime();
  const ageH = ageMs / 3600000;
  // 0h => 60 分，72h => 0 分
  const score = Math.max(0, 1 - ageH / 72) * 60;
  return score;
}

function computeSourceWeightFactor(sourceId) {
  return SOURCE_WEIGHTS[sourceId] || 1.0;
}

// “社会价值”关键词权重（偏政策/法律/医疗/教育/公益等）
const USEFULNESS_WEIGHTS = [
  { kw: '平权', w: 14 },
  { kw: '同婚', w: 14 },
  { kw: '婚姻平权', w: 18 },
  { kw: '反歧视', w: 16 },
  { kw: '反歧視', w: 16 },
  { kw: '立法', w: 12 },
  { kw: '修法', w: 12 },
  { kw: '法案', w: 12 },
  { kw: '法院', w: 12 },
  { kw: '判决', w: 12 },
  { kw: '判決', w: 12 },
  { kw: '人权', w: 14 },
  { kw: '人權', w: 14 },
  { kw: '人道', w: 10 },
  { kw: '公共政策', w: 12 },
  { kw: '政策', w: 10 },
  { kw: '教育', w: 8 },
  { kw: '校园', w: 8 },
  { kw: '校園', w: 8 },
  { kw: '医疗', w: 12 },
  { kw: '醫療', w: 12 },
  { kw: '医保', w: 10 },
  { kw: '醫保', w: 10 },
  { kw: '诊疗', w: 10 },
  { kw: '診療', w: 10 },
  { kw: '心理', w: 8 },
  { kw: '艾滋', w: 10 },
  { kw: 'HIV', w: 10 },
  { kw: '公益', w: 10 },
  { kw: 'NGO', w: 10 },
  { kw: '救助', w: 10 },
  { kw: '庇护', w: 12 },
  { kw: '庇護', w: 12 },
  { kw: '庇护所', w: 12 },
  { kw: '庇護所', w: 12 },
  { kw: '职场', w: 10 },
  { kw: '職場', w: 10 },
  { kw: '反霸凌', w: 12 },
  { kw: '反霸凌', w: 12 },
  { kw: '反家暴', w: 12 },
  { kw: '家暴', w: 10 },
];

function computeUsefulnessScore(title) {
  if (!title) return 0;
  const t = title.toLowerCase();
  let score = 0;
  for (const { kw, w } of USEFULNESS_WEIGHTS) {
    if (t.includes(kw.toLowerCase())) score += w;
  }
  return Math.min(score, 40);
}

function withinWindow(item, windowKey) {
  if (windowKey === 'all') return true;
  if (!item.publishedAt) return windowKey === 'all';
  const t = new Date(item.publishedAt).getTime();
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (windowKey === 'today') return t >= startOfToday.getTime();
  if (windowKey === '48h') return now - t <= 48 * 3600 * 1000;
  if (windowKey === '7d') return now - t <= 7 * 24 * 3600 * 1000;
  return true;
}

function applyFilters() {
  const sourceFilter = els.sourceSelect.value;
  const kw = (els.keywordInput.value || '').trim().toLowerCase();
  const windowKey = els.timeWindow.value;

  const filtered = state.items.filter((it) => {
    if (sourceFilter !== 'all' && it.sourceId !== sourceFilter) return false;
    if (kw) {
      const inTitle = it.title.toLowerCase().includes(kw);
      const inSource = (it.sourceName || '').toLowerCase().includes(kw);
      if (!inTitle && !inSource) return false;
    }
    if (!withinWindow(it, windowKey)) return false;
    return true;
  });

  // 计算聚合主题键并统计频次（用于热度分）
  const topicCount = new Map();
  const topicKeyOf = new Map();
  for (const it of filtered) {
    const key = normalizeTitleForTopicKey(it.title);
    topicKeyOf.set(it, key);
    topicCount.set(key, (topicCount.get(key) || 0) + 1);
  }

  // 计算热度分
  for (const it of filtered) {
    const recency = computeRecencyScore(it.publishedAt);
    const kwScore = computeKeywordScore(it.title);
    const sourceFactor = computeSourceWeightFactor(it.sourceId);
    const clusterBoost = Math.min(Math.max((topicCount.get(topicKeyOf.get(it)) || 1) - 1, 0) * 8, 24);
    const raw = (recency + kwScore + clusterBoost) * sourceFactor;
    it.heat = Math.round(raw);
    it.topicKey = topicKeyOf.get(it);
    it.usefulness = Math.round(computeUsefulnessScore(it.title));
  }

  // 默认列表仍按时间倒序展示
  state.filteredItems = sortByDateDesc(filtered);
  renderList();
}

function formatDateForDisplay(iso) {
  if (!iso) return '时间未知';
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return '时间未知';
  }
}

function renderList() {
  els.newsList.innerHTML = '';
  for (const it of state.filteredItems) {
    const li = document.createElement('li');
    li.className = 'card';
    const title = document.createElement('h3');
    const a = document.createElement('a');
    a.href = it.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = it.title;
    title.appendChild(a);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const heat = Number.isFinite(it.heat) ? ` <span>·</span><span>🔥${it.heat}</span>` : '';
    meta.innerHTML = `<span>${it.sourceName}</span><span>·</span><time>${formatDateForDisplay(it.publishedAt)}</time>${heat}`;

    li.appendChild(title);
    li.appendChild(meta);
    els.newsList.appendChild(li);
  }
  setStatus(`已加载 ${state.filteredItems.length} 条`);
}

function buildTweetText(items, limit = 8) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const header = `#LGBTQ 今日速递 ${y}${m}${d} #同志 #LGBT #跨性别`;
  const lines = [header];
  const sortedByHeat = items.slice().sort((a, b) => (b.heat || 0) - (a.heat || 0));
  const sortedByValue = items.slice().sort((a, b) => (b.usefulness || 0) - (a.usefulness || 0));
  const heatNum = Math.min(4, limit);
  const valueNum = Math.min(4, Math.max(0, limit - heatNum));

  // 热度 TOP
  lines.push('【热度较高】');
  const topHeat = sortedByHeat.slice(0, heatNum);
  topHeat.forEach((it, idx) => {
    const t = it.title.replace(/\s+/g, ' ').trim();
    const heat = Number.isFinite(it.heat) ? ` (🔥${it.heat})` : '';
    lines.push(`${idx + 1}. ${t}${heat} ${it.link}`);
  });

  // 价值 TOP（去重）
  lines.push('【对社群有用】');
  const used = new Set(topHeat.map(i => i.id));
  const topValue = [];
  for (const it of sortedByValue) {
    if (topValue.length >= valueNum) break;
    if (used.has(it.id)) continue;
    if ((it.usefulness || 0) <= 0) continue;
    topValue.push(it);
  }
  if (topValue.length === 0) {
    lines.push('（暂无明显的政策/医疗/教育/法律等相关资讯）');
  } else {
    topValue.forEach((it, idx) => {
      const t = it.title.replace(/\s+/g, ' ').trim();
      const val = Number.isFinite(it.usefulness) ? ` (💡${it.usefulness})` : '';
      lines.push(`${idx + 1}. ${t}${val} ${it.link}`);
    });
  }

  lines.push('更多：自定义来源与关键词，点击网页上的“导出 JSON/诊断网络”');
  return lines.join('\n');
}

function loadSample() {
  const now = Date.now();
  const make = (t, src, id) => ({
    id: `${src}:${id}`,
    title: t,
    link: 'https://example.com',
    publishedAt: new Date(now - id * 3600 * 1000).toISOString(),
    sourceId: src,
    sourceName: src,
  });
  const fake = [
    make('台湾跨性别就医保障讨论升温', 'gnews-zh-tw', 2),
    make('同性恋平权议题在亚洲持续发酵', 'gnews-zh-cn', 8),
    make('Gay rights milestone celebrated in city parade', 'gnews-en', 4),
    make('PinkNews: Major win for LGBTQ protections', 'pinknews', 1),
    make('LGBTQ Nation: Policy changes spark debate', 'lgbtqnation', 10),
  ];
  state.items = sortByDateDesc(fake);
  applyFilters();
  setStatus('已加载示例数据');
}

async function runDiagnostics() {
  els.logView.textContent = '';
  log('开始网络诊断');
  const url = 'https://example.com';
  try {
    const res = await withTimeout(fetch(url, { cache: 'no-store', mode: 'no-cors' }), 6000, '基础网络超时');
    log('基础联网 ok (no-cors)', url, String(res && res.type));
  } catch (e) {
    log('基础联网失败', url, String(e));
  }

  for (const s of state.sources.slice(0, 3)) {
    try {
      const xml = await fetchRssRaw(s.url);
      const items = parseRssXml(xml, s);
      log('源可用', s.name, '条目', items.length);
    } catch (e) {
      log('源不可用', s.name, String(e));
    }
  }
  setStatus('诊断完成');
}

async function copyTodayTweet() {
  const items = state.filteredItems;
  if (!items.length) {
    setStatus('暂无可复制内容');
    return;
  }
  const text = buildTweetText(items);
  try {
    await navigator.clipboard.writeText(text);
    setStatus('已复制今日推文');
  } catch (e) {
    setStatus('复制失败，请手动选择文本复制');
    console.error(e);
  }
}

function exportJson() {
  const data = {
    generatedAt: new Date().toISOString(),
    total: state.filteredItems.length,
    items: state.filteredItems,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lgbt-news-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function loadAll() {
  setStatus('加载中…');
  els.newsList.innerHTML = '';
  const all = [];
  const failures = [];
  try {
    await Promise.all(state.sources.map(async (src) => {
      try {
        const xml = await fetchRssRaw(src.url);
        const items = parseRssXml(xml, src);
        all.push(...items);
      } catch (e) {
        log('抓取失败', src.name, String(e));
        failures.push(src.name);
      }
    }));
  } catch (e) {
    log('加载过程出现异常', String(e));
  }

  const uniqueSorted = sortByDateDesc(deduplicate(all));
  state.items = uniqueSorted;
  if (all.length === 0) {
    const ok = await loadFromMirror();
    if (!ok) setStatus('加载失败：网络或跨域限制。可点“示例数据/诊断网络”，或将项目推到 GitHub 使用自动镜像数据');
  } else if (failures.length) {
    setStatus(`加载完成（部分失败：${failures.join(', ')}）`);
  }
  applyFilters();
}

function initSourceSelect() {
  while (els.sourceSelect.options.length > 1) {
    els.sourceSelect.remove(1);
  }
  state.sources.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.name;
    els.sourceSelect.appendChild(opt);
  });
}

function initEvents() {
  els.refreshBtn.addEventListener('click', () => loadAll());
  els.copyBtn.addEventListener('click', () => copyTodayTweet());
  els.exportBtn.addEventListener('click', () => exportJson());
  els.keywordInput.addEventListener('input', () => applyFilters());
  els.sourceSelect.addEventListener('change', () => applyFilters());
  els.timeWindow.addEventListener('change', () => applyFilters());
  if (els.sampleBtn) els.sampleBtn.addEventListener('click', () => loadSample());
  if (els.diagBtn) els.diagBtn.addEventListener('click', () => runDiagnostics());
}

function init() {
  initSourceSelect();
  initEvents();
  // 全局错误捕获到诊断面板
  window.addEventListener('error', (e) => {
    log('JS错误', e.message, e.filename, `${e.lineno}:${e.colno}`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    log('未处理Promise拒绝', String(e.reason));
  });
  loadAll();
}

document.addEventListener('DOMContentLoaded', init);


