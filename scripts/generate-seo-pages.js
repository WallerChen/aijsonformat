#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://aijsonformat.com";
const WRITE = process.argv.includes("--write");

const data = loadSiteData();
const files = new Map();

for (const tool of data.tools) {
  files.set(`tools/${tool.id}/index.html`, renderToolPage(tool, data));
}

for (const guide of data.guidePages) {
  files.set(`${guide.id}/index.html`, renderGuidePage(guide, data));
}

for (const directory of data.directoryPages) {
  files.set(`${directory.id === "directories" ? "directories" : directory.id}/index.html`, renderDirectoryPage(directory, data));
}

files.set("sitemap.xml", renderSitemap(data));

let changed = 0;
for (const [relativePath, content] of files) {
  const absolutePath = path.join(ROOT, relativePath);
  const current = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
  if (current !== content) {
    changed += 1;
    if (WRITE) {
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, content);
    }
    console.log(`${WRITE ? "updated" : "would update"} ${relativePath}`);
  }
}

if (!changed) {
  console.log(`SEO pages are up to date (${files.size} generated files checked).`);
} else if (!WRITE) {
  console.log(`${changed} generated file${changed === 1 ? "" : "s"} would change. Run with --write to update them.`);
}

function loadSiteData() {
  const source = fs.readFileSync(path.join(ROOT, "assets/app.js"), "utf8");
  const app = { dataset: { page: "home" }, innerHTML: "" };
  const fakeElement = () => ({
    value: "",
    textContent: "",
    className: "",
    dataset: {},
    addEventListener() {},
    classList: { toggle() {} },
    focus() {},
    select() {}
  });
  const context = {
    document: {
      getElementById(id) {
        return id === "app" ? app : fakeElement();
      },
      querySelectorAll() {
        return [];
      },
      createElement() {
        return fakeElement();
      },
      body: { appendChild() {} }
    },
    window: {
      location: { pathname: "/", origin: SITE_URL },
      crypto: {
        randomUUID: () => "00000000-0000-4000-8000-000000000000",
        getRandomValues(array) {
          return array.fill(1);
        }
      },
      isSecureContext: true
    },
    navigator: { clipboard: { writeText() {} } },
    URL,
    URLSearchParams,
    TextEncoder,
    btoa(value) {
      return Buffer.from(value, "binary").toString("base64");
    },
    atob(value) {
      return Buffer.from(value, "base64").toString("binary");
    },
    fetch: async () => ({ status: 501, json: async () => ({ error: "not configured" }) }),
    console
  };
  context.window.window = context.window;
  vm.runInNewContext(source, context, { filename: "assets/app.js" });
  return context.window.__AI_JSON_FORMAT_DATA__;
}

function renderHead({ title, description, canonical, jsonLd, ogType = "website" }) {
  const url = `${SITE_URL}${canonical}`;
  const image = `${SITE_URL}/assets/og-default.png`;
  return [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta property="og:site_name" content="AI JSON Format" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    '<link rel="stylesheet" href="/assets/styles.css" />',
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-CHFCLKH3CD"></script>',
    "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-CHFCLKH3CD');</script>",
    ...jsonLd.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
  ].join("\n    ");
}

function renderShell({ lang = "en", head, pageId, body, loadApp = false }) {
  const script = loadApp
    ? `\n    <script defer src="/assets/app.js"></script>`
    : "";
  return `<!doctype html>
<html lang="${lang}">
  <head>
    ${head}
  </head>
  <body>
    <div id="app" data-page="${escapeHtml(pageId)}">
      <div class="site-shell">
${indent(siteHeader(), 8)}
${indent(body, 8)}
${indent(siteFooter(), 8)}
      </div>
    </div>
    <script>${prefetchScript()}</script>${script}
  </body>
</html>
`;
}

function siteHeader() {
  return `<header class="topbar">
  <nav class="nav" aria-label="Primary">
    <a class="brand" href="/">
      <span class="brand-mark">{ }</span>
      <span>AI JSON Format</span>
    </a>
    <div class="nav-links">
      <a class="nav-primary" href="/tools/json-formatter/">Format JSON</a>
      <a class="nav-primary" href="/tools/ai-json-repair/">AI Repair</a>
      <details class="nav-menu">
        <summary>Tools</summary>
        <div class="nav-menu-panel">
          <a href="/tools/">All Tools</a>
          <a href="/ai-json-tools/">AI JSON Tools</a>
          <a href="/json-tools/">JSON Tools</a>
          <a href="/json-converter-tools/">Converters</a>
          <a href="/text-tools/">Text Tools</a>
          <a href="/developer-tools/">Developer Tools</a>
        </div>
      </details>
      <details class="nav-menu">
        <summary>Resources</summary>
        <div class="nav-menu-panel">
          <a href="/directories/">Directories</a>
          <a href="/guides/">Guides</a>
          <a href="/languages/">Languages</a>
          <a href="/tools/ai-json-schema-generator/">AI Schema</a>
          <a href="/tools/ai-mock-json-generator/">Mock JSON</a>
          <a href="/tools/ai-regex-generator/">AI Regex</a>
        </div>
      </details>
    </div>
  </nav>
</header>`;
}

function siteFooter() {
  return `<footer class="footer">
  <div class="footer-inner">
    <span>AI JSON Format provides free browser-based developer utilities.</span>
    <span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/contact/">Contact</a></span>
  </div>
</footer>`;
}

function prefetchScript() {
  return `(function(){var seen=new Set();function pf(href){if(!href||seen.has(href))return;seen.add(href);try{var l=document.createElement('link');l.rel='prefetch';l.href=href;l.as='document';document.head.appendChild(l);}catch(e){}}function on(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=a.getAttribute('href');if(!u||u[0]!=='/'||u.indexOf('//')===0||u.indexOf('#')===0)return;if(a.host&&a.host!==location.host)return;pf(u);}document.addEventListener('mouseover',on,{passive:true});document.addEventListener('touchstart',on,{passive:true});})();`;
}

function renderToolPage(tool, data) {
  const related = relatedTools(tool, data).slice(0, 6);
  const jsonLd = [
    breadcrumbLd([
      ["Home", "/"],
      ["Tools", "/tools/"],
      [tool.title, tool.path]
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.title,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: `${SITE_URL}${tool.path}`,
      description: tool.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    },
    faqLd(tool.faq)
  ];
  const sample = tool.sample ? String(tool.sample) : "";
  const body = `<main class="main">
  ${breadcrumbHtml([["Home", "/"], ["Tools", "/tools/"], [tool.title]])}
  <section class="tool-intro">
    <div class="eyebrow">${escapeHtml(tool.category)} tool</div>
    <h1>${escapeHtml(tool.title)}</h1>
    <p>${escapeHtml(tool.description)}</p>
    <p><a class="button primary" href="#tool-mount">Use the tool</a></p>
  </section>
  <div id="tool-mount" data-tool-id="${escapeHtml(tool.id)}"></div>
  <section class="content-band">
    <h2>Common use cases</h2>
    <ul class="plain-list">
      ${toolUseCases(tool).map((item) => `<li>${escapeHtml(item)}</li>`).join("\n      ")}
    </ul>
  </section>
  ${sample ? `<section class="content-band">
    <h2>Example input</h2>
    <pre class="code-sample"><code>${escapeHtml(sample)}</code></pre>
  </section>` : ""}
  <section class="content-band">
    <h2>Related tools</h2>
    <div class="tool-grid">
      ${related.map(renderToolCard).join("\n      ")}
    </div>
  </section>
  ${renderFaq(tool.faq)}
</main>`;
  return renderShell({
    head: renderHead({
      title: `${tool.title} - Free Online ${tool.category} Tool`,
      description: tool.description,
      canonical: tool.path,
      jsonLd
    }),
    pageId: tool.id,
    body,
    loadApp: true
  });
}

function renderGuidePage(guide, data) {
  const tool = data.tools.find((item) => item.id === guide.primaryToolId) || data.tools[0];
  const related = relatedGuides(guide, data).slice(0, 6);
  const detailsHtml = renderGuideDetails(guide.details);
  const examplesHtml = renderGuideExamples(guide.examples);
  const body = `<main class="main">
  ${breadcrumbHtml([["Home", "/"], ["Guides", "/guides/"], [guide.title]])}
  <section class="tool-intro">
    <div class="eyebrow">${escapeHtml(guide.category)}</div>
    <h1>${escapeHtml(guide.title)}</h1>
    <p>${escapeHtml(guide.description)}</p>
    <p><a class="button primary" href="${tool.path}">Open ${escapeHtml(tool.title)}</a></p>
  </section>
  <section class="content-band">
    <h2>How to do it</h2>
    <ol class="steps-list">
      ${guide.points.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n      ")}
    </ol>
  </section>
  ${detailsHtml}
  ${examplesHtml}
  <section class="content-band">
    <h2>Recommended tool</h2>
    <div class="tool-grid">${renderToolCard(tool)}</div>
  </section>
  <section class="content-band">
    <h2>Related guides</h2>
    <div class="tool-grid">
      ${related.map(renderGuideCard).join("\n      ")}
    </div>
  </section>
  ${renderFaq(guide.faq)}
</main>`;
  return renderShell({
    head: renderHead({
      title: `${guide.title} - AI JSON Format`,
      description: guide.description,
      canonical: `/${guide.id}/`,
      ogType: "article",
      jsonLd: [
        breadcrumbLd([["Home", "/"], ["Guides", "/guides/"], [guide.title, `/${guide.id}/`]]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          mainEntityOfPage: `${SITE_URL}/${guide.id}/`
        },
        faqLd(guide.faq)
      ]
    }),
    pageId: guide.id,
    body
  });
}

function renderGuideDetails(details) {
  if (!Array.isArray(details) || !details.length) return "";
  const sections = details.map((section) => {
    const heading = section && section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : "";
    const paragraphs = (section && Array.isArray(section.paragraphs) ? section.paragraphs : [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("\n      ");
    const list = section && Array.isArray(section.list) && section.list.length
      ? `<ul class="plain-list">${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";
    return `<section class="content-band">
      ${heading}
      ${paragraphs}
      ${list}
    </section>`;
  });
  return sections.join("\n  ");
}

function renderGuideExamples(examples) {
  if (!Array.isArray(examples) || !examples.length) return "";
  const blocks = examples.map((example) => {
    const heading = example && example.heading ? `<h3>${escapeHtml(example.heading)}</h3>` : "";
    const inputBlock = example && example.input
      ? `<p class="example-label">Input</p><pre class="code-sample"><code>${escapeHtml(example.input)}</code></pre>`
      : "";
    const outputBlock = example && example.output
      ? `<p class="example-label">Output</p><pre class="code-sample"><code>${escapeHtml(example.output)}</code></pre>`
      : "";
    const note = example && example.note ? `<p>${escapeHtml(example.note)}</p>` : "";
    return `<article class="example-item">${heading}${inputBlock}${outputBlock}${note}</article>`;
  }).join("\n      ");
  return `<section class="content-band">
    <h2>Examples</h2>
    <div class="example-list">
      ${blocks}
    </div>
  </section>`;
}

function renderDirectoryPage(directory, data) {
  const tools = (directory.toolIds || []).map((id) => data.tools.find((item) => item.id === id)).filter(Boolean);
  const guides = (directory.guideIds || []).map((id) => data.guidePages.find((item) => item.id === id)).filter(Boolean);
  const children = (directory.directoryIds || []).map((id) => data.directoryPages.find((item) => item.id === id)).filter(Boolean);
  const body = `<main class="main">
  ${breadcrumbHtml([["Home", "/"], ["Directories", "/directories/"], [directory.title]])}
  <section class="tool-intro">
    <div class="eyebrow">${escapeHtml(directory.category)}</div>
    <h1>${escapeHtml(directory.title)}</h1>
    <p>${escapeHtml(directory.description)}</p>
  </section>
  <section class="content-band">
    <h2>${directory.id === "directories" ? "Choose a directory" : "What this directory covers"}</h2>
    <p>${escapeHtml(directory.intro)}</p>
  </section>
  ${children.length ? `<section class="content-band"><h2>Directories</h2><div class="tool-grid">${children.map(renderDirectoryCard).join("")}</div></section>` : ""}
  ${tools.length ? `<section class="content-band"><h2>Tools in this directory</h2><div class="tool-grid">${tools.map(renderToolCard).join("")}</div></section>` : ""}
  ${guides.length ? `<section class="content-band"><h2>Related guides</h2><div class="tool-grid">${guides.map(renderGuideCard).join("")}</div></section>` : ""}
</main>`;
  return renderShell({
    head: renderHead({
      title: `${directory.title} - AI JSON Format`,
      description: directory.description,
      canonical: directory.path,
      jsonLd: [
        breadcrumbLd([["Home", "/"], ["Directories", "/directories/"], [directory.title, directory.path]]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: directory.title,
          url: `${SITE_URL}${directory.path}`,
          description: directory.description
        },
        itemListLd([...tools.map((item) => [item.title, item.path]), ...guides.map((item) => [item.title, `/${item.id}/`])])
      ]
    }),
    pageId: directory.id,
    body
  });
}

function renderSitemap(data) {
  const urls = [
    "/",
    "/tools/",
    "/guides/",
    ...data.tools.map((tool) => tool.path),
    ...data.guidePages.map((guide) => `/${guide.id}/`),
    ...data.directoryPages.map((directory) => directory.path),
    "/privacy/",
    "/terms/",
    "/contact/",
    "/languages/",
    ...data.languagePages.map((language) => language.path)
  ];
  const uniqueUrls = Array.from(new Set(urls));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map((url) => `  <url><loc>${SITE_URL}${url}</loc></url>`).join("\n")}
</urlset>
`;
}

function renderToolCard(tool) {
  return `<a class="tool-card" href="${tool.path}"><span><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.description)}</p></span><span class="tag-row"><span class="tag">${escapeHtml(tool.category)}</span><span class="tag">Free</span></span></a>`;
}

function renderGuideCard(guide) {
  return `<a class="tool-card" href="/${guide.id}/"><span><h3>${escapeHtml(guide.title)}</h3><p>${escapeHtml(guide.description)}</p></span><span class="tag-row"><span class="tag">${escapeHtml(guide.category)}</span><span class="tag">Guide</span></span></a>`;
}

function renderDirectoryCard(directory) {
  return `<a class="tool-card" href="${directory.path}"><span><h3>${escapeHtml(directory.title)}</h3><p>${escapeHtml(directory.description)}</p></span><span class="tag-row"><span class="tag">${escapeHtml(directory.category)}</span><span class="tag">Directory</span></span></a>`;
}

function renderFaq(faq) {
  return `<section class="content-band"><h2>FAQ</h2><div class="faq">${faq.map(([question, answer]) => `<article class="faq-item"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}</div></section>`;
}

function breadcrumbHtml(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map(([label, href], index) => href && index < items.length - 1 ? `<a href="${href}">${escapeHtml(label)}</a><span>/</span>` : `<span>${escapeHtml(label)}</span>`).join("")}</nav>`;
}

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url ? `${SITE_URL}${url}` : undefined
    })).filter((item) => item.item)
  };
}

function faqLd(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };
}

function itemListLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map(([name, url], index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${url}`,
      name
    }))
  };
}

function relatedTools(tool, data) {
  return data.tools
    .filter((item) => item.id !== tool.id)
    .sort((a, b) => Number(b.category === tool.category) - Number(a.category === tool.category));
}

function relatedGuides(guide, data) {
  return data.guidePages
    .filter((item) => item.id !== guide.id)
    .sort((a, b) => Number(b.category === guide.category || b.primaryToolId === guide.primaryToolId) - Number(a.category === guide.category || a.primaryToolId === guide.primaryToolId));
}

function toolUseCases(tool) {
  const cases = {
    JSON: ["Format API responses for debugging.", "Clean JSON before sharing it in docs.", "Prepare examples for prompts, tests and frontend code."],
    AI: ["Turn rough notes or model output into structured data.", "Review AI-generated JSON before using it.", "Create schemas, mock data and regex drafts faster."],
    Hash: ["Create quick checksums for snippets.", "Compare text fingerprints during debugging.", "Generate hashes locally without a server round trip."],
    Time: ["Convert timestamps from logs and API payloads.", "Copy seconds or milliseconds for scripts.", "Compare local time and UTC quickly."],
    Encode: ["Encode values for URLs and HTML.", "Decode copied tokens and payload snippets.", "Inspect data without switching tools."],
    Text: ["Clean copied notes and prompts.", "Sort, replace and deduplicate text lists.", "Prepare content for docs and development tasks."],
    Random: ["Generate identifiers and passwords for tests.", "Create random local values.", "Copy outputs into API clients or fixtures."]
  };
  return cases[tool.category] || cases.JSON;
}

function indent(value, spaces) {
  const prefix = " ".repeat(spaces);
  return value.split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
