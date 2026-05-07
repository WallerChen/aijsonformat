#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://aijsonformat.com";
const IMAGE = `${SITE}/assets/og-default.png`;

const targets = [
  "ja/index.html",
  "de/index.html",
  "es/index.html",
  "languages/index.html",
  "privacy/index.html",
  "terms/index.html",
  "contact/index.html",
  "guides/index.html",
  "tools/index.html",
  "404.html"
];

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pickType(relativePath) {
  return "website";
}

function inject(file) {
  const absolute = path.join(ROOT, file);
  const original = fs.readFileSync(absolute, "utf8");
  if (original.includes('property="og:type"')) {
    console.log(`skip (already has og): ${file}`);
    return;
  }
  const title = (original.match(/<title>([\s\S]*?)<\/title>/) || [, ""])[1].trim();
  const description = (original.match(/<meta\s+name="description"\s+content="([^"]*)"/) || [, ""])[1].trim();
  const canonicalMatch = original.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/);
  const url = canonicalMatch ? canonicalMatch[1] : `${SITE}/${file.replace(/index\.html$/, "")}`;
  const block = [
    `<meta property="og:type" content="${pickType(file)}" />`,
    `<meta property="og:site_name" content="AI JSON Format" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${IMAGE}" />`
  ].join("\n    ");

  let updated;
  if (canonicalMatch) {
    updated = original.replace(canonicalMatch[0], `${canonicalMatch[0]}\n    ${block}`);
  } else {
    // No canonical (404 page). Inject before </head>.
    updated = original.replace(/<\/head>/i, `    ${block}\n  </head>`);
  }

  if (updated === original) {
    console.log(`no change: ${file}`);
    return;
  }
  fs.writeFileSync(absolute, updated);
  console.log(`updated: ${file}`);
}

for (const file of targets) {
  try {
    inject(file);
  } catch (error) {
    console.error(`error on ${file}: ${error.message}`);
  }
}
