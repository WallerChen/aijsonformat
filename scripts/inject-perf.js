#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PREFETCH = `<script>(function(){var seen=new Set();function pf(href){if(!href||seen.has(href))return;seen.add(href);try{var l=document.createElement('link');l.rel='prefetch';l.href=href;l.as='document';document.head.appendChild(l);}catch(e){}}function on(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=a.getAttribute('href');if(!u||u[0]!=='/'||u.indexOf('//')===0||u.indexOf('#')===0)return;if(a.host&&a.host!==location.host)return;pf(u);}document.addEventListener('mouseover',on,{passive:true});document.addEventListener('touchstart',on,{passive:true});})();</script>`;

const DNS = '<link rel="dns-prefetch" href="https://www.googletagmanager.com" />\n    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />';

const targets = [
  "index.html",
  "tools/index.html",
  "guides/index.html",
  "contact/index.html",
  "privacy/index.html",
  "terms/index.html",
  "languages/index.html",
  "ja/index.html",
  "de/index.html",
  "es/index.html",
  "404.html"
];

function patch(file) {
  const absolute = path.join(ROOT, file);
  if (!fs.existsSync(absolute)) {
    console.log(`skip (not found): ${file}`);
    return;
  }
  let html = fs.readFileSync(absolute, "utf8");
  const original = html;

  if (!html.includes('rel="dns-prefetch" href="https://www.googletagmanager.com"')) {
    html = html.replace(
      /<script async src="https:\/\/www\.googletagmanager\.com/,
      `${DNS}\n    <script async src="https://www.googletagmanager.com`
    );
  }

  html = html.replace(/<script src="\/assets\/app\.js"><\/script>/g, '<script defer src="/assets/app.js"></script>');

  if (!html.includes("rel='prefetch'") && !html.includes('rel="prefetch"')) {
    html = html.replace(/<\/body>/, `    ${PREFETCH}\n  </body>`);
  }

  if (html === original) {
    console.log(`no change: ${file}`);
    return;
  }
  fs.writeFileSync(absolute, html);
  console.log(`updated: ${file}`);
}

for (const file of targets) {
  try {
    patch(file);
  } catch (error) {
    console.error(`error on ${file}: ${error.message}`);
  }
}
