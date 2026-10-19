/* Solaris Riding Club — static site builder.
 * Reads content/site.json and writes index.html.
 * No dependencies (Node 14+). Run: `node build.js`
 * Pages CMS edits content/site.json; Vercel runs this on each deploy. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const content = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "site.json"), "utf8"));

/* ---------- helpers ---------- */
function escText(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escAttr(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/"/g,"&quot;"); }
// bilingual element: default text = EN, data-en / data-ru carry both
function bi(tag, cls, obj, extra){
  const c = cls ? ` class="${cls}"` : "";
  const x = extra ? " " + extra : "";
  return `<${tag}${c}${x} data-en="${escAttr(obj.en)}" data-ru="${escAttr(obj.ru)}">${escText(obj.en)}</${tag}>`;
}
function telHref(phone){ return "tel:" + String(phone).replace(/[^0-9+]/g, ""); }

/* ---------- reusable SVGs ---------- */
const svgTelegram = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.8 16.6 9.6 20c.4 0 .6-.2.8-.4l1.9-1.8 3.9 2.9c.7.4 1.2.2 1.4-.7l2.6-12.1c.3-1.1-.4-1.6-1.1-1.3L3.4 9.9c-1.1.4-1 .9-.2 1.2l4.3 1.3L18 6.1c.5-.3.9-.1.6.2z"/></svg>';
const svgArrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const svgMapArrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
const svgSun = '<svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="23" cy="23" r="9" fill="#E0A11E"/><g stroke="#5E7B34" stroke-width="2.4" stroke-linecap="round"><line x1="23" y1="3" x2="23" y2="9"/><line x1="23" y1="37" x2="23" y2="43"/><line x1="3" y1="23" x2="9" y2="23"/><line x1="37" y1="23" x2="43" y2="23"/><line x1="9" y1="9" x2="13" y2="13"/><line x1="33" y1="33" x2="37" y2="37"/><line x1="37" y1="9" x2="33" y2="13"/><line x1="13" y1="33" x2="9" y2="37"/></g></svg>';
const svgSunDark = '<svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="23" cy="23" r="9" fill="#E0A11E"/><g stroke="#E0A11E" stroke-width="2.4" stroke-linecap="round"><line x1="23" y1="3" x2="23" y2="9"/><line x1="23" y1="37" x2="23" y2="43"/><line x1="3" y1="23" x2="9" y2="23"/><line x1="37" y1="23" x2="43" y2="23"/><line x1="9" y1="9" x2="13" y2="13"/><line x1="33" y1="33" x2="37" y2="37"/><line x1="37" y1="9" x2="33" y2="13"/><line x1="13" y1="33" x2="9" y2="37"/></g></svg>';
const svgIG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .4 1.4.8.4.4.6.8.8 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.4 1-.8 1.4-.4.4-.8.6-1.4.8-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.4-1.4-.8-.4-.4-.6-.8-.8-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.4-1 .8-1.4.4-.4.8-.6 1.4-.8.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 1.9c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1m0 3.3a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2m0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6m5.8-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0"/></svg>';
const svgTikTok = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.8c-.9-.6-1.5-1.6-1.7-2.7 0-.2 0-.5 0-.7h-3v13.1c0 1.4-1.1 2.5-2.5 2.5S6.9 16.9 6.9 15.5s1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1v-3.1c-.3 0-.5-.1-.8-.1-3 0-5.5 2.5-5.5 5.6s2.5 5.6 5.5 5.6 5.5-2.5 5.5-5.6V9.3c1.1.8 2.5 1.3 4 1.3v-3c-.9 0-1.7-.3-2.4-.7z"/></svg>';
const svgTelegramSocial = svgTelegram;

/* ---------- navigation (static labels) ---------- */
const NAV = [
  ["#home", { en: "Home", ru: "Главная" }],
  ["#about", { en: "About", ru: "О нас" }],
  ["#herd", { en: "The herd", ru: "Лошади" }],
  ["#experiences", { en: "Experiences", ru: "Занятия" }],
  ["#prices", { en: "Prices", ru: "Цены" }],
  ["#gallery", { en: "Gallery", ru: "Галерея" }],
  ["#visiting", { en: "Visiting", ru: "Посещение" }],
  ["#contact", { en: "Contact", ru: "Контакты" }]
];
const navSidebar = NAV.map(function(n, i){
  const active = i === 0 ? ' class="active"' : "";
  return `      <a href="${n[0]}"${active} data-en="${escAttr(n[1].en)}" data-ru="${escAttr(n[1].ru)}">${escText(n[1].en)}</a>`;
}).join("\n");
const navMobile = NAV.map(function(n){
  return `  <a href="${n[0]}" data-en="${escAttr(n[1].en)}" data-ru="${escAttr(n[1].ru)}">${escText(n[1].en)}</a>`;
}).join("\n");

/* ---------- sections ---------- */
const c = content;
const bookHref = escAttr(c.booking.telegramUrl);
const phoneHref = telHref(c.booking.phone);

const heroTitle =
  `<h1><span data-en="${escAttr(c.hero.titleLead.en)}" data-ru="${escAttr(c.hero.titleLead.ru)}">${escText(c.hero.titleLead.en)}</span> ` +
  `<span class="accent" data-en="${escAttr(c.hero.titleAccent.en)}" data-ru="${escAttr(c.hero.titleAccent.ru)}">${escText(c.hero.titleAccent.en)}</span></h1>`;

const stripItems = [
  [c.strip.visitsLabel, c.strip.visitsValue, true],
  [c.strip.openLabel, c.strip.openValue, true],
  [c.strip.locationLabel, c.strip.locationValue, true],
  [c.strip.languagesLabel, c.strip.languagesValue, false]
].map(function(it){
  const k = `<div class="strip__k" data-en="${escAttr(it[0].en)}" data-ru="${escAttr(it[0].ru)}">${escText(it[0].en)}</div>`;
  let v;
  if(it[2]) v = `<div class="strip__v" data-en="${escAttr(it[1].en)}" data-ru="${escAttr(it[1].ru)}">${escText(it[1].en)}</div>`;
  else v = `<div class="strip__v">${escText(it[1])}</div>`;
  return `        <div class="strip__item">${k}${v}</div>`;
}).join("\n");

const aboutParas = c.about.paragraphs.map(function(p){ return "            " + bi("p", null, p); }).join("\n");

const herdCards = c.herd.members.map(function(m){
  return `          <article class="herd__card reveal">
            <div class="ph"><img src="${escAttr(m.image)}" alt="${escAttr(m.imageAlt)}" style="object-position:center top" loading="lazy"></div>
            <div class="herd__body"><h3>${escText(m.name)}</h3>${bi("span", "herd__role", m.role)}</div>
          </article>`;
}).join("\n");

const expCards = c.experiences.items.map(function(it, i){
  const num = String(i + 1).padStart(2, "0");
  const pos = it.focusTop ? ' style="object-position:center top"' : "";
  return `          <article class="exp__card reveal">
            <div class="exp__ph"><span class="exp__num">${num}</span><img src="${escAttr(it.image)}" alt="${escAttr(it.imageAlt)}"${pos} loading="lazy"></div>
            <div class="exp__body">${bi("h3", null, it.title)}${bi("p", null, it.text)}</div>
          </article>`;
}).join("\n");

const priceRows = c.prices.rows.map(function(r){
  const unit = `<span data-en="${escAttr(c.prices.unit.en)}" data-ru="${escAttr(c.prices.unit.ru)}">${escText(c.prices.unit.en)}</span>`;
  return `          <div class="price__row">
            <div>${bi("div", "price__name", r.name)}${bi("span", "price__meta", r.meta)}</div>
            <div class="price__val">${escText(r.amount)} ${unit}</div>
          </div>`;
}).join("\n");

const galleryItems = c.gallery.images.map(function(g){
  return `          <a href="${escAttr(g.image)}"><img src="${escAttr(g.image)}" alt="${escAttr(g.alt)}" loading="lazy"></a>`;
}).join("\n");

const visitRules = c.visiting.rules.map(function(r, i){
  const n = String(i + 1).padStart(2, "0");
  return `            <li><span class="n">${n}</span>${bi("span", "t", r)}</li>`;
}).join("\n");

/* ---------- full document ---------- */
const CSS = `
/* ============ TOKENS ============ */
:root{
  --cream:#FAF6EA;
  --cream-2:#F1EAD6;
  --paper:#FFFDF6;
  --ink:#2E2517;
  --ink-soft:#5B4F3B;
  --muted:#8C7C62;
  --green:#5E7B34;
  --green-700:#48611F;
  --gold:#E0A11E;
  --gold-700:#B67F12;
  --terra:#B26A3A;
  --dark:#2A2114;
  --dark-2:#372C1B;
  --line:rgba(46,37,23,.13);
  --line-soft:rgba(46,37,23,.08);
  --sidebar-w:270px;
  --radius:20px;
  --shadow:0 18px 50px -20px rgba(46,37,23,.35);
  --ease:cubic-bezier(.22,.61,.36,1);
}

*{box-sizing:border-box;}
html{scroll-behavior:smooth;scroll-padding-top:80px;}
body{
  margin:0;
  background:var(--cream);
  color:var(--ink-soft);
  font-family:"Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  font-size:17px;
  line-height:1.65;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
img{max-width:100%;display:block;}
a{color:inherit;text-decoration:none;}
h1,h2,h3,h4{font-family:"Fraunces","Georgia",serif;color:var(--ink);line-height:1.04;font-weight:600;margin:0;letter-spacing:-.01em;}

.eyebrow{
  font-family:"Inter",sans-serif;
  text-transform:uppercase;
  letter-spacing:.18em;
  font-size:12.5px;
  font-weight:600;
  color:var(--green);
  margin:0 0 22px;
}
.accent{color:var(--gold-700);}
.serif-em{font-style:italic;}

/* ============ LAYOUT ============ */
.layout{display:flex;min-height:100dvh;}
.main{flex:1;min-width:0;}
.wrap{max-width:1180px;margin:0 auto;padding:0 clamp(20px,4vw,64px);}
section{padding:clamp(64px,9vw,120px) 0;}

/* ============ SIDEBAR ============ */
.sidebar{
  width:var(--sidebar-w);
  flex-shrink:0;
  position:sticky;
  top:0;
  height:100dvh;
  background:var(--cream);
  border-right:1px solid var(--line);
  display:flex;
  flex-direction:column;
  padding:34px 30px;
  z-index:60;
}
.brand{display:flex;align-items:center;gap:13px;}
.brand__mark{width:46px;height:46px;flex-shrink:0;}
.brand__name{font-family:"Fraunces",serif;font-weight:700;color:var(--ink);font-size:19px;line-height:1.02;letter-spacing:-.01em;}
.brand__name small{display:block;font-family:"Inter",sans-serif;font-weight:600;font-size:9.5px;letter-spacing:.22em;color:var(--green);text-transform:uppercase;margin-top:4px;}
.brand__tag{margin-top:16px;font-size:12.5px;color:var(--muted);font-style:italic;font-family:"Fraunces",serif;line-height:1.35;}

.nav{margin-top:44px;display:flex;flex-direction:column;gap:2px;}
.nav a{
  font-weight:500;font-size:16px;color:var(--ink);
  padding:9px 0;position:relative;width:fit-content;
  transition:color .25s var(--ease);
}
.nav a::after{
  content:"";position:absolute;left:0;bottom:6px;width:0;height:2px;
  background:var(--gold);transition:width .3s var(--ease);
}
.nav a:hover{color:var(--green-700);}
.nav a:hover::after,.nav a.active::after{width:100%;}
.nav a.active{color:var(--green-700);}

.sidebar__foot{margin-top:auto;padding-top:28px;}
.lang{
  display:inline-flex;background:var(--cream-2);border-radius:999px;padding:4px;
  border:1px solid var(--line-soft);
}
.lang button{
  border:0;background:transparent;font-family:inherit;font-weight:600;font-size:13px;
  color:var(--muted);padding:7px 15px;border-radius:999px;cursor:pointer;
  transition:all .25s var(--ease);letter-spacing:.03em;
}
.lang button.on{background:var(--ink);color:var(--cream);}

/* ============ TOPBAR (mobile) ============ */
.topbar{
  display:none;position:sticky;top:0;z-index:70;
  background:rgba(250,246,234,.92);backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
  padding:14px 20px;align-items:center;justify-content:space-between;gap:14px;
}
.topbar .brand__name{font-size:16px;}
.topbar .brand__mark{width:38px;height:38px;}
.topbar__right{display:flex;align-items:center;gap:12px;}
.burger{
  width:44px;height:44px;border:1px solid var(--line);background:var(--paper);
  border-radius:12px;display:grid;place-items:center;cursor:pointer;
}
.burger span,.burger span::before,.burger span::after{
  content:"";display:block;width:20px;height:2px;background:var(--ink);border-radius:2px;transition:.3s var(--ease);
}
.burger span::before{transform:translateY(-6px);}
.burger span::after{transform:translateY(4px);}
body.nav-open .burger span{background:transparent;}
body.nav-open .burger span::before{transform:rotate(45deg);}
body.nav-open .burger span::after{transform:rotate(-45deg) translateY(-1px);}

.mobile-nav{
  display:none;position:fixed;inset:0;z-index:65;
  background:var(--cream);padding:88px 28px 40px;
  flex-direction:column;gap:6px;
  transform:translateY(-8px);opacity:0;pointer-events:none;transition:.3s var(--ease);
}
body.nav-open .mobile-nav{opacity:1;transform:none;pointer-events:auto;}
.mobile-nav a{font-family:"Fraunces",serif;font-size:27px;color:var(--ink);padding:9px 0;border-bottom:1px solid var(--line-soft);}

/* ============ HERO ============ */
.hero{display:grid;grid-template-columns:1.05fr 1fr;min-height:calc(100dvh - 0px);align-items:stretch;padding:0;}
.hero__text{padding:clamp(48px,7vw,96px) clamp(24px,5vw,80px);display:flex;flex-direction:column;justify-content:center;}
.hero h1{font-size:clamp(44px,6.6vw,92px);font-weight:600;margin:0 0 26px;max-width:12ch;}
.hero__sub{font-size:clamp(16px,1.4vw,19px);max-width:44ch;color:var(--ink-soft);margin:0 0 38px;}
.hero__cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center;}
.hero__media{position:relative;overflow:hidden;background:var(--cream-2);}
.hero__media img{width:100%;height:100%;object-fit:cover;}
.hero__media::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(46,37,23,.14),transparent 40%);}

.btn{
  display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:15.5px;
  padding:16px 28px;border-radius:999px;cursor:pointer;border:0;font-family:inherit;
  transition:transform .25s var(--ease),background .25s var(--ease),box-shadow .25s var(--ease);
}
.btn svg{width:17px;height:17px;}
.btn--primary{background:var(--gold);color:var(--dark);box-shadow:0 10px 24px -10px rgba(224,161,30,.8);}
.btn--primary:hover{background:var(--gold-700);color:#fff;transform:translateY(-2px);}
.btn--dark{background:var(--ink);color:var(--cream);}
.btn--dark:hover{background:var(--green-700);transform:translateY(-2px);}
.btn--ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line);}
.btn--ghost:hover{border-color:var(--green);color:var(--green-700);}
.link-arrow{font-weight:600;color:var(--ink);display:inline-flex;align-items:center;gap:7px;transition:gap .25s var(--ease),color .25s;}
.link-arrow:hover{gap:12px;color:var(--green-700);}
.link-arrow svg{width:15px;height:15px;}

/* info strip under hero */
.strip{background:var(--dark);color:var(--cream);}
.strip__grid{display:grid;grid-template-columns:repeat(4,1fr);}
.strip__item{padding:26px clamp(20px,3vw,40px);border-right:1px solid rgba(255,255,255,.1);}
.strip__item:last-child{border-right:0;}
.strip__k{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:7px;}
.strip__v{font-family:"Fraunces",serif;font-size:19px;color:#fff;font-weight:500;}

/* ============ ABOUT ============ */
.about__grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,6vw,90px);align-items:start;}
.about__left h2{font-size:clamp(34px,4vw,54px);margin-bottom:28px;}
.about__portrait{border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);aspect-ratio:4/4.3;}
.about__portrait img{width:100%;height:100%;object-fit:cover;}
.about__right p{margin:0 0 20px;font-size:17px;}
.pullquote{
  margin-top:32px;padding-top:26px;border-top:1px solid var(--line);
  font-family:"Fraunces",serif;font-style:italic;font-size:20px;color:var(--ink);line-height:1.4;
}

/* ============ HERD ============ */
.section-head{max-width:640px;margin-bottom:52px;}
.section-head h2{font-size:clamp(32px,4vw,50px);}
.section-head p{margin:18px 0 0;color:var(--ink-soft);}
.herd__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
.herd__card{background:var(--paper);border:1px solid var(--line-soft);border-radius:var(--radius);overflow:hidden;transition:transform .35s var(--ease),box-shadow .35s var(--ease);}
.herd__card:hover{transform:translateY(-5px);box-shadow:var(--shadow);}
.herd__card .ph{aspect-ratio:3/4;overflow:hidden;}
.herd__card img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease);}
.herd__card:hover img{transform:scale(1.05);}
.herd__body{padding:22px 24px 26px;}
.herd__body h3{font-size:23px;margin-bottom:5px;}
.herd__role{font-size:13.5px;color:var(--green-700);font-weight:600;letter-spacing:.02em;}
.herd__note{margin-top:26px;font-style:italic;font-family:"Fraunces",serif;color:var(--muted);font-size:16px;}

/* ============ EXPERIENCES ============ */
.exp-band{background:var(--cream-2);}
.exp__grid{display:grid;grid-template-columns:repeat(2,1fr);gap:26px;}
.exp__card{background:var(--paper);border-radius:var(--radius);overflow:hidden;border:1px solid var(--line-soft);display:flex;flex-direction:column;transition:transform .35s var(--ease),box-shadow .35s var(--ease);}
.exp__card:hover{transform:translateY(-5px);box-shadow:var(--shadow);}
.exp__ph{aspect-ratio:16/10;overflow:hidden;position:relative;}
.exp__ph img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease);}
.exp__card:hover .exp__ph img{transform:scale(1.05);}
.exp__num{position:absolute;top:16px;left:18px;background:var(--gold);color:var(--dark);font-weight:700;font-size:13px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-family:"Fraunces",serif;}
.exp__body{padding:26px 28px 30px;}
.exp__body h3{font-size:24px;margin-bottom:10px;}
.exp__body p{margin:0;font-size:15.5px;color:var(--ink-soft);}

/* ============ PRICES ============ */
.price__row{
  display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;
  padding:26px 4px;border-top:1px solid var(--line);
}
.price__row:last-of-type{border-bottom:1px solid var(--line);}
.price__name{font-family:"Fraunces",serif;font-size:clamp(20px,2.4vw,27px);color:var(--ink);font-weight:500;}
.price__meta{font-family:"Inter",sans-serif;font-size:13.5px;color:var(--muted);font-weight:500;display:block;margin-top:3px;letter-spacing:.01em;}
.price__val{font-family:"Fraunces",serif;font-size:clamp(20px,2.4vw,27px);color:var(--green-700);font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums;}
.price__foot{margin-top:30px;display:flex;flex-wrap:wrap;gap:20px 40px;align-items:center;justify-content:space-between;}
.price__who{font-size:15px;color:var(--ink-soft);}
.price__who b{color:var(--ink);font-weight:600;}

/* ============ GALLERY ============ */
.gallery{columns:3;column-gap:16px;}
.gallery a{display:block;margin:0 0 16px;border-radius:14px;overflow:hidden;break-inside:avoid;cursor:zoom-in;position:relative;background:var(--cream-2);}
.gallery img{width:100%;transition:transform .6s var(--ease),filter .4s var(--ease);}
.gallery a:hover img{transform:scale(1.04);filter:brightness(.95);}

/* ============ VISITING ============ */
.visit-band{background:var(--green);color:#F4F1E4;}
.visit-band .eyebrow{color:#DCE8B8;}
.visit-band h2{color:#fff;font-size:clamp(32px,4vw,50px);}
.visit__grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(36px,6vw,80px);align-items:start;}
.visit__list{list-style:none;margin:0;padding:0;}
.visit__list li{display:grid;grid-template-columns:auto 1fr;gap:18px;padding:20px 0;border-top:1px solid rgba(255,255,255,.18);align-items:baseline;}
.visit__list li:first-child{border-top:0;}
.visit__list .n{font-family:"Fraunces",serif;color:#EAD48A;font-weight:600;font-size:15px;}
.visit__list .t{color:#F4F1E4;font-size:16.5px;}
.visit__map{margin-top:clamp(40px,5vw,60px);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);border:4px solid rgba(255,255,255,.55);}
.visit__map iframe{display:block;width:100%;height:clamp(300px,40vw,440px);border:0;}
.visit__here{margin-top:8px;}
.visit__here h3{color:#fff;font-size:26px;margin-bottom:16px;}
.visit__here p{color:#EDE9D8;font-size:16px;margin:0 0 24px;}
.btn--ondark{background:#fff;color:var(--green-700);}
.btn--ondark:hover{background:var(--gold);color:var(--dark);transform:translateY(-2px);}

/* ============ CONTACT ============ */
.contact{background:var(--dark);color:var(--cream);position:relative;overflow:hidden;}
.contact__mark{position:absolute;right:-4%;top:50%;transform:translateY(-50%);width:min(46%,520px);opacity:.05;pointer-events:none;}
.contact .eyebrow{color:var(--gold);}
.contact h2{color:#fff;font-size:clamp(38px,5.5vw,74px);max-width:14ch;margin-bottom:44px;}
.contact__grid{display:grid;grid-template-columns:1.1fr 1fr;gap:48px;position:relative;z-index:1;}
.c-k{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:12px;}
.c-phone{font-family:"Fraunces",serif;font-size:clamp(30px,4vw,46px);color:#fff;font-weight:600;letter-spacing:.01em;}
.c-sub{color:#C9BFA8;margin:8px 0 0;font-size:15px;}
.contact__cta{display:flex;flex-wrap:wrap;gap:13px;margin-top:64px;}
.c-block{margin-bottom:34px;}
.c-block p{margin:0;color:#E7E0CE;font-size:16px;}
.socials{display:flex;gap:12px;margin-top:14px;}
.socials a{width:46px;height:46px;border:1px solid rgba(255,255,255,.2);border-radius:12px;display:grid;place-items:center;transition:.25s var(--ease);}
.socials a:hover{background:var(--gold);border-color:var(--gold);transform:translateY(-3px);}
.socials a:hover svg{fill:var(--dark);}
.socials svg{width:20px;height:20px;fill:var(--cream);transition:fill .25s;}
.contact__foot{margin-top:56px;padding-top:26px;border-top:1px solid rgba(255,255,255,.13);display:flex;flex-wrap:wrap;justify-content:space-between;gap:14px;font-size:13px;color:#A89C82;position:relative;z-index:1;}

/* ============ LIGHTBOX ============ */
.lightbox{position:fixed;inset:0;z-index:200;background:rgba(28,22,13,.94);display:none;align-items:center;justify-content:center;padding:32px;}
.lightbox.on{display:flex;}
.lightbox img{max-width:92vw;max-height:88vh;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.6);}
.lightbox__close{position:absolute;top:22px;right:26px;width:48px;height:48px;border:1px solid rgba(255,255,255,.3);background:transparent;border-radius:50%;color:#fff;font-size:24px;cursor:pointer;display:grid;place-items:center;}
.lightbox__nav{position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.2);border-radius:50%;color:#fff;font-size:24px;cursor:pointer;display:grid;place-items:center;}
.lightbox__nav.prev{left:20px;} .lightbox__nav.next{right:20px;}

/* ============ REVEAL ============ */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s var(--ease),transform .7s var(--ease);}
.reveal.in{opacity:1;transform:none;}

/* ============ RESPONSIVE ============ */
@media(max-width:1080px){
  .hero{grid-template-columns:1fr;min-height:auto;}
  .hero__media{min-height:56vh;order:-1;}
}
@media(max-width:900px){
  .sidebar{display:none;}
  .topbar{display:flex;}
  .mobile-nav{display:flex;}
  .about__grid,.visit__grid,.contact__grid{grid-template-columns:1fr;gap:40px;}
  .exp__grid{grid-template-columns:1fr;}
  .herd__grid{grid-template-columns:1fr;max-width:440px;}
  .gallery{columns:2;}
  .strip__grid{grid-template-columns:1fr 1fr;}
  .strip__item:nth-child(2){border-right:0;}
  .strip__item{border-bottom:1px solid rgba(255,255,255,.1);}
}
@media(max-width:560px){
  body{font-size:16px;}
  .hero__text{padding:44px 22px 52px;}
  .strip__grid{grid-template-columns:1fr;}
  .strip__item{border-right:0;}
  .gallery{columns:1;}
  .price__row{grid-template-columns:1fr;gap:6px;}
  .price__val{font-size:22px;}
  .contact h2{font-size:38px;}
}
@media(prefers-reduced-motion:reduce){
  *{scroll-behavior:auto!important;}
  .reveal{opacity:1!important;transform:none!important;transition:none!important;}
  .btn,.herd__card,.exp__card,.gallery img{transition:none!important;}
}`;

const SCRIPT = `
(function(){
  "use strict";

  /* ---------- Language ---------- */
  var STORE = "solaris_lang";
  function getLang(){ try { return localStorage.getItem(STORE) || "en"; } catch(e){ return "en"; } }
  function setLang(lang){
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-en]").forEach(function(el){
      var val = el.getAttribute("data-" + lang);
      if(val != null) el.innerHTML = val;
    });
    document.querySelectorAll(".lang button").forEach(function(b){
      b.classList.toggle("on", b.getAttribute("data-lang") === lang);
    });
    var map = document.getElementById("visit-map");
    if(map){
      var msrc = map.getAttribute("data-src-" + lang);
      if(msrc && map.getAttribute("src") !== msrc) map.setAttribute("src", msrc);
    }
    try { localStorage.setItem(STORE, lang); } catch(e){}
  }
  document.querySelectorAll(".lang button").forEach(function(b){
    b.addEventListener("click", function(){ setLang(b.getAttribute("data-lang")); });
  });
  setLang(getLang());

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".burger");
  burger.addEventListener("click", function(){
    var open = document.body.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.querySelectorAll(".mobile-nav a").forEach(function(a){
    a.addEventListener("click", function(){ document.body.classList.remove("nav-open"); burger.setAttribute("aria-expanded","false"); });
  });

  /* ---------- Active nav on scroll ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".nav a");
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        navLinks.forEach(function(l){
          l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id);
        });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function(s){ spy.observe(s); });

  /* ---------- Reveal ---------- */
  var revealOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(revealOK){
    var ro = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function(el){ ro.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img");
  var links = Array.prototype.slice.call(document.querySelectorAll("#gallery-grid a"));
  var idx = 0;
  function open(i){ idx = (i + links.length) % links.length; lbImg.src = links[idx].getAttribute("href"); lbImg.alt = links[idx].querySelector("img").alt; lb.classList.add("on"); lb.setAttribute("aria-hidden","false"); }
  function close(){ lb.classList.remove("on"); lb.setAttribute("aria-hidden","true"); lbImg.src=""; }
  links.forEach(function(a, i){ a.addEventListener("click", function(ev){ ev.preventDefault(); open(i); }); });
  lb.querySelector(".lightbox__close").addEventListener("click", close);
  lb.querySelector(".prev").addEventListener("click", function(){ open(idx-1); });
  lb.querySelector(".next").addEventListener("click", function(){ open(idx+1); });
  lb.addEventListener("click", function(ev){ if(ev.target === lb) close(); });
  document.addEventListener("keydown", function(ev){
    if(!lb.classList.contains("on")) return;
    if(ev.key === "Escape") close();
    if(ev.key === "ArrowLeft") open(idx-1);
    if(ev.key === "ArrowRight") open(idx+1);
  });
})();`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escText(c.meta.title)}</title>
<meta name="description" content="${escAttr(c.meta.description)}" />

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>${CSS}
</style>
</head>
<body>

<!-- ============ MOBILE TOPBAR ============ -->
<header class="topbar">
  <a href="#home" class="brand">
    <span class="brand__mark" aria-hidden="true">${svgSun}</span>
    <span class="brand__name">Solaris<small>Riding Club</small></span>
  </a>
  <div class="topbar__right">
    <div class="lang" role="group" aria-label="Language">
      <button data-lang="en" class="on">EN</button>
      <button data-lang="ru">RU</button>
    </div>
    <button class="burger" aria-label="Menu" aria-expanded="false"><span></span></button>
  </div>
</header>

<nav class="mobile-nav" aria-label="Mobile">
${navMobile}
</nav>

<div class="layout">

  <!-- ============ SIDEBAR ============ -->
  <aside class="sidebar">
    <a href="#home" class="brand">
      <span class="brand__mark" aria-hidden="true">${svgSun}</span>
      <span class="brand__name">Solaris<small>Riding Club</small></span>
    </a>
    ${bi("p", "brand__tag", c.brand.tagline)}

    <nav class="nav" aria-label="Primary">
${navSidebar}
    </nav>

    <div class="sidebar__foot">
      <div class="lang" role="group" aria-label="Language">
        <button data-lang="en" class="on">EN</button>
        <button data-lang="ru">RU</button>
      </div>
    </div>
  </aside>

  <!-- ============ MAIN ============ -->
  <main class="main">

    <!-- HERO -->
    <section id="home" class="hero">
      <div class="hero__text">
        ${bi("p", "eyebrow", c.hero.eyebrow)}
        ${heroTitle}
        ${bi("p", "hero__sub", c.hero.subtitle)}
        <div class="hero__cta">
          <a class="btn btn--primary" href="${bookHref}" target="_blank" rel="noopener">
            ${svgTelegram}
            ${bi("span", null, c.booking.bookLabel)}
          </a>
          <a class="link-arrow" href="#prices">
            ${bi("span", null, c.hero.seePricesLabel)}
            ${svgArrow}
          </a>
        </div>
      </div>
      <div class="hero__media">
        <img src="${escAttr(c.hero.image)}" alt="${escAttr(c.hero.imageAlt)}" fetchpriority="high" width="2200" height="1467">
      </div>
    </section>

    <!-- INFO STRIP -->
    <div class="strip">
      <div class="strip__grid">
${stripItems}
      </div>
    </div>

    <!-- ABOUT -->
    <section id="about">
      <div class="wrap">
        <div class="about__grid">
          <div class="about__left reveal">
            ${bi("p", "eyebrow", c.about.eyebrow)}
            ${bi("h2", null, c.about.heading)}
            <div class="about__portrait">
              <img src="${escAttr(c.about.image)}" alt="${escAttr(c.about.imageAlt)}" loading="lazy" width="1400" height="1544">
            </div>
          </div>
          <div class="about__right reveal">
${aboutParas}
            ${bi("p", "pullquote", c.about.quote)}
          </div>
        </div>
      </div>
    </section>

    <!-- HERD -->
    <section id="herd" style="padding-top:0;">
      <div class="wrap">
        <div class="section-head reveal">
          ${bi("p", "eyebrow", c.herd.eyebrow)}
          ${bi("h2", null, c.herd.heading)}
        </div>
        <div class="herd__grid">
${herdCards}
        </div>
        ${bi("p", "herd__note reveal", c.herd.note)}
      </div>
    </section>

    <!-- EXPERIENCES -->
    <section id="experiences" class="exp-band">
      <div class="wrap">
        <div class="section-head reveal">
          ${bi("p", "eyebrow", c.experiences.eyebrow)}
          ${bi("h2", null, c.experiences.heading)}
          ${bi("p", null, c.experiences.intro)}
        </div>
        <div class="exp__grid">
${expCards}
        </div>
      </div>
    </section>

    <!-- PRICES -->
    <section id="prices">
      <div class="wrap">
        <div class="section-head reveal">
          ${bi("p", "eyebrow", c.prices.eyebrow)}
          ${bi("h2", null, c.prices.heading)}
        </div>

        <div class="reveal">
${priceRows}

          <div class="price__foot">
            ${bi("p", "price__who", c.prices.note)}
            <a class="btn btn--dark" href="${bookHref}" target="_blank" rel="noopener">
              ${svgTelegram}
              ${bi("span", null, c.booking.bookLabel)}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- GALLERY -->
    <section id="gallery" class="exp-band" style="padding-top:clamp(56px,7vw,90px);">
      <div class="wrap">
        <div class="section-head reveal">
          ${bi("p", "eyebrow", c.gallery.eyebrow)}
          ${bi("h2", null, c.gallery.heading)}
        </div>
        <div class="gallery reveal" id="gallery-grid">
${galleryItems}
        </div>
      </div>
    </section>

    <!-- VISITING -->
    <section id="visiting" class="visit-band">
      <div class="wrap">
        <div class="visit__grid">
          <div class="reveal">
            ${bi("p", "eyebrow", c.visiting.eyebrow)}
            ${bi("h2", null, c.visiting.heading)}
            <div class="visit__here" style="margin-top:36px;">
              ${bi("h3", null, c.visiting.hereHeading)}
              ${bi("p", null, c.visiting.hereText)}
              <a class="btn btn--ondark" href="${escAttr(c.visiting.mapLink)}" target="_blank" rel="noopener">
                ${bi("span", null, c.visiting.mapButtonLabel)}
                ${svgMapArrow}
              </a>
            </div>
          </div>
          <ul class="visit__list reveal">
${visitRules}
          </ul>
        </div>
        <div class="visit__map reveal">
          <iframe id="visit-map" title="Map to Solaris Riding Club"
            src="${escAttr(c.visiting.mapEmbedEn)}"
            data-src-en="${escAttr(c.visiting.mapEmbedEn)}"
            data-src-ru="${escAttr(c.visiting.mapEmbedRu)}"
            allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="contact">
      <div class="contact__mark" aria-hidden="true">${svgSunDark}</div>
      <div class="wrap">
        ${bi("p", "eyebrow", c.contact.eyebrow)}
        ${bi("h2", null, c.contact.heading)}
        <div class="contact__grid">
          <div>
            <div class="c-block">
              ${bi("div", "c-k", c.contact.bookingLabel)}
              <a class="c-phone" href="${phoneHref}">${escText(c.booking.phone)}</a>
              ${bi("p", "c-sub", c.contact.bookingSub)}
              <div class="contact__cta">
                <a class="btn btn--primary" href="${bookHref}" target="_blank" rel="noopener">
                  ${svgTelegram}
                  ${bi("span", null, c.contact.messageLabel)}
                </a>
                <a class="btn btn--ghost" style="color:#F4EEDD;border-color:rgba(255,255,255,.25);" href="${phoneHref}">
                  ${bi("span", null, c.contact.callLabel)}
                </a>
              </div>
            </div>
          </div>
          <div>
            <div class="c-block">
              ${bi("div", "c-k", c.contact.hoursLabel)}
              ${bi("p", null, c.contact.hoursText)}
            </div>
            <div class="c-block">
              ${bi("div", "c-k", c.contact.locationLabel)}
              ${bi("p", null, c.contact.locationText)}
            </div>
            <div class="c-block" style="margin-bottom:0;">
              ${bi("div", "c-k", c.contact.followLabel)}
              <div class="socials">
                <a href="${escAttr(c.contact.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${svgIG}</a>
                <a href="${escAttr(c.contact.tiktok)}" target="_blank" rel="noopener" aria-label="TikTok">${svgTikTok}</a>
                <a href="${escAttr(c.contact.telegram)}" target="_blank" rel="noopener" aria-label="Telegram">${svgTelegramSocial}</a>
              </div>
            </div>
          </div>
        </div>
        <div class="contact__foot">
          <span>${escText(c.contact.footerLeft)}</span>
          ${bi("span", null, c.contact.footerRight)}
        </div>
      </div>
    </section>

  </main>
</div>

<!-- LIGHTBOX -->
<div class="lightbox" id="lightbox" aria-hidden="true">
  <button class="lightbox__close" aria-label="Close">&times;</button>
  <button class="lightbox__nav prev" aria-label="Previous">&#8249;</button>
  <img src="" alt="">
  <button class="lightbox__nav next" aria-label="Next">&#8250;</button>
</div>

<script>${SCRIPT}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "index.html"), html, "utf8");
console.log("Built index.html (" + (html.length / 1024).toFixed(0) + " KB) from content/site.json");
