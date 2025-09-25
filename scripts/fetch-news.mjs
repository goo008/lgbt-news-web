import Parser from 'rss-parser';
import { fetch } from 'undici';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const parser = new Parser();

const SOURCES = [
  // 英文媒体
  { id: 'pinknews', name: 'PinkNews', url: 'https://www.pinknews.co.uk/feed/' },
  { id: 'lgbtqnation', name: 'LGBTQ Nation', url: 'https://www.lgbtqnation.com/feed/' },
  { id: 'guardian-lgbt', name: 'The Guardian - LGBT rights', url: 'https://www.theguardian.com/world/lgbt-rights/rss' },
  { id: 'them-us', name: 'them.us', url: 'https://www.them.us/feeds/all.rss.xml' },
  { id: 'out-mag', name: 'OUT', url: 'https://www.out.com/rss.xml' },
  // Google 新闻（中文/英文综合）
  { id: 'gnews-zh-cn', name: 'Google 新闻（中文-综合）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20%E5%8F%98%E6%80%A7%20OR%20%E6%80%A7%E5%B0%91%E6%95%B0%29%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-zh-tw', name: 'Google 新聞（繁體-綜合）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%88%80%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%A5%20OR%20%E8%AE%8A%E6%80%A7%20OR%20%E6%80%A7%E5%B0%91%E6%95%B8%29%20when%3A7d&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant' },
  { id: 'gnews-en', name: 'Google News (EN - LGBT/Gay)', url: 'https://news.google.com/rss/search?q=%28gay%20OR%20homosexual%20OR%20LGBT%20OR%20LGBTQ%20OR%20transgender%20OR%20nonbinary%20OR%20queer%29%20when%3A7d&hl=en-US&gl=US&ceid=US%3Aen' },
  // Google 新闻 - 平台定向（中文）
  { id: 'gnews-weixin', name: 'Google 新闻（微信公众号）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20site%3Aweixin.qq.com%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-toutiao', name: 'Google 新闻（今日头条）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20site%3Atoutiao.com%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-baidu', name: 'Google 新闻（百度/百家号）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20%28site%3Abaidu.com%20OR%20site%3Abaijiahao.baidu.com%29%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  { id: 'gnews-douyin', name: 'Google 新闻（抖音）', url: 'https://news.google.com/rss/search?q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%29%20site%3Adouyin.com%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans' },
  // X(Twitter) 通过 Nitter 搜索 RSS（多实例冗余）
  { id: 'nitter-net', name: 'X 搜索（nitter.net）', url: 'https://nitter.net/search/rss?f=tweets&q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20gay%29' },
  { id: 'nitter-privacydev', name: 'X 搜索（privacydev）', url: 'https://nitter.privacydev.net/search/rss?f=tweets&q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20gay%29' },
  { id: 'nitter-poast', name: 'X 搜索（poast）', url: 'https://nitter.poast.org/search/rss?f=tweets&q=%28%E5%90%8C%E5%BF%97%20OR%20%E5%90%8C%E6%80%A7%E6%81%8B%20OR%20LGBT%20OR%20LGBTQ%20OR%20%E8%B7%A8%E6%80%A7%E5%88%AB%20OR%20gay%29' },
];

function toISO(date) {
  try {
    const d = new Date(date);
    if (!isNaN(d)) return d.toISOString();
  } catch {}
  return null;
}

async function fetchOne(url) {
  // 直接抓取，不要代理（Actions 网络可直连）
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function run() {
  const items = [];
  for (const s of SOURCES) {
    try {
      const text = await fetchOne(s.url);
      const feed = await parser.parseString(text);
      for (const it of feed.items || []) {
        const link = it.link || it.guid || '';
        const title = (it.title || '').trim();
        const iso = toISO(it.isoDate || it.pubDate || it.published || it.updated);
        if (!title || !link) continue;
        items.push({
          id: `${s.id}:${link}`,
          title,
          link,
          publishedAt: iso,
          sourceId: s.id,
          sourceName: s.name,
        });
      }
      console.log('ok', s.name);
    } catch (e) {
      console.log('fail', s.name, String(e));
    }
  }

  const out = { generatedAt: new Date().toISOString(), items };
  const file = resolve(process.cwd(), 'public/data/news.json');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(out, null, 2));
  console.log('wrote', file);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


