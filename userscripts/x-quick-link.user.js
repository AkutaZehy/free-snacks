// ==UserScript==
// @name         X Quick Link
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在 X (Twitter) 分享键旁新增「打开」和「复制链接」按钮
// @author       Ponytail
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://mobile.twitter.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const ATTR = 'data-xql';
    const HOVER_BG = 'rgba(29,155,240,0.1)';

    function tweetUrl(btn) {
        const a = btn.closest('article');
        if (!a) return null;
        const t = a.querySelector('time');
        if (!t) return null;
        const link = t.closest('a');
        return link ? `https://x.com${link.getAttribute('href')}` : null;
    }

    function makeBtn(text, fn) {
        const b = document.createElement('button');
        b.textContent = text;
        b.setAttribute('type', 'button');
        b.style.cssText = 'background:none;border:none;color:rgb(83,100,113);padding:0 8px;cursor:pointer;font:inherit;border-radius:9999px;';
        b.onmouseenter = () => { b.style.backgroundColor = HOVER_BG; };
        b.onmouseleave = () => { b.style.backgroundColor = 'transparent'; };
        b.onclick = (e) => { e.stopPropagation(); fn(b); };
        return b;
    }

    function inject(group) {
        // 分享按钮: aria-haspopup="menu" 且没有 data-testid（retweet 有 data-testid="retweet"）
        const share = group.querySelector('button[aria-haspopup="menu"]:not([data-testid])');
        if (!share || share.hasAttribute(ATTR)) return;

        const url = tweetUrl(share);
        if (!url) return;

        // 向上找到分享按钮的容器（第二个父级 div），在其后插入
        const wrap = share.parentElement?.parentElement;
        if (!wrap) return;

        const openBtn = makeBtn('打开', () => window.open(url, '_blank'));
        const copyBtn = makeBtn('复制', async (b) => {
            try {
                await navigator.clipboard.writeText(url);
                const orig = b.textContent;
                b.textContent = '已复制';
                setTimeout(() => { b.textContent = orig; }, 1000);
            } catch (err) {
                console.error('XQL: copy failed', err);
            }
        });

        wrap.parentNode.insertBefore(openBtn, wrap.nextSibling);
        wrap.parentNode.insertBefore(copyBtn, openBtn.nextSibling);
        share.setAttribute(ATTR, '1');
    }

    function run() {
        document.querySelectorAll('[role="group"]').forEach(inject);
    }

    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
})();