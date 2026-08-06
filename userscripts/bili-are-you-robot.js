// ==UserScript==
// @name         你是入机吗？
// @namespace    https://github.com/bili-are-you-robot
// @version      1.0.0
// @description  B站点赞/粉丝人机粗略检测
// @author       Sisyphus
// @match        https://space.bilibili.com/*/relation/fans*
// @match        https://member.bilibili.com/platform/fans/manage*
// @match        https://message.bilibili.com/*
// @include      https://message.bilibili.com/#/love/*
// @icon         https://static.hdslb.com/images/favicon.ico
// @connect      bilibili.com
// @connect      api.vc.bilibili.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @license      MIT
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // =====================================================================
    // 配置常量
    // =====================================================================
    const CONFIG = {
        SCAN_INTERVAL: 5000,          // 扫描间隔 (ms)
        REQUEST_DELAY: 1500,          // API 请求间最小间隔 (ms)
        RATE_LIMIT_DELAY: 10000,      // 限频后退避时间 (ms)
        CACHE_EXPIRE: 24 * 60 * 60 * 1000, // 检测结果缓存 (24小时)
    };

    const RULES = {
        followThreshold: 5,           // 关注数阈值（≤ 此值视为单向吸粉特征）
    };

    const TAGS = {
        robot: { text: 'R', color: '#FF4444' },
        human: { text: 'H', color: '#44DD44' },
    };

    // =====================================================================
    // B站 API 封装
    // =====================================================================
    const API = {
        // 只用动态接口：风控松、返回含 昵称/头像/关注数/动态数
        dynamicUrl: 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space',
        bangumiUrl: 'https://api.bilibili.com/x/space/bangumi/follow/list',
        favUrl: 'https://api.bilibili.com/x/v3/fav/folder/created/list-all',
        likeUrl: 'https://api.bilibili.com/x/msgfeed/like_detail',

        request(url, params = {}) {
            return new Promise((resolve, reject) => {
                const query = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
                const fullUrl = query ? `${url}?${query}` : url;
                const timer = setTimeout(() => reject(new Error('Request timeout')), 10000);
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: fullUrl,
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': location.origin + '/',
                    },
                    onload(res) {
                        clearTimeout(timer);
                        if (res.status === 200) {
                            try {
                                const data = JSON.parse(res.responseText);
                                if (data.code === 0) resolve(data.data);
                                else reject(new Error(`API error(${data.code}): ${data.message} @ ${url}`));
                            } catch (e) { reject(new Error('JSON parse error')); }
                        } else {
                            reject(new Error(`HTTP ${res.status}`));
                        }
                    },
                    onerror: (e) => { clearTimeout(timer); reject(e); },
                    ontimeout: () => { clearTimeout(timer); reject(new Error('GM timeout')); }
                });
            });
        },

        async getDynamic(mid) {
            this.consecutiveFails = 0;
            return this.request(this.dynamicUrl, { host_mid: mid });
        },

        async getBangumi(mid) {
            const d = await this.request(this.bangumiUrl, { vmid: mid, type: 1, pn: 1, ps: 1 });
            return d.total || 0;
        },

        async getFav(mid) {
            const d = await this.request(this.favUrl, { up_mid: mid });
            return d.count || 0;
        },

        // 获取动态点赞用户列表（支持分页）
        async getLikeList(dynamicId, pn = 1) {
            // 接口为 x/msgfeed/like_detail，需要 card_id（URL 中 /love/{cardId}）
            const d = await this.request(this.likeUrl, { card_id: dynamicId, pn, last_view_at: 0, build: 0, mobi_app: 'web' });
            const likes = (d.items || []).map(it => {
                const u = it.user || {};
                return { mid: String(u.mid), uname: u.nickname || u.uname || '', face: u.avatar || u.face || '', level: 0 };
            });
            const page = d.page || {};
            return { likes, hasMore: page.is_end === false, total: (d.total || (d.items && d.items.length) || 0) };
        }
    };

    // =====================================================================
    // 检测引擎（分层检测 + 缓存）
    // =====================================================================
    class DetectionEngine {
        constructor() {
            this.cache = new Map();
            this.lastRequestTime = 0;
            this.rateLimitUntil = 0;   // 全局限频解冻时间
            this.consecutiveFails = 0;  // 连续失败计数（用于指数退避）
        }

        getCached(mid) {
            // 1. 内存缓存
            const c = this.cache.get(mid);
            if (c && Date.now() - c.timestamp < CONFIG.CACHE_EXPIRE) return c.result;
            // 2. 回退查持久层（跨页整刷后内存丢失时用）
            try {
                const all = GM_getValue('detection_cache', {});
                const d = all[mid];
                if (d && Date.now() - d.timestamp < CONFIG.CACHE_EXPIRE) {
                    this.cache.set(mid, d);  // 补回内存
                    return d.result;
                }
            } catch (e) {}
            return null;
        }

        setCache(mid, result) {
            this.cache.set(mid, { result, timestamp: Date.now() });
            // 增量落盘，避免刷新丢失
            try {
                const all = GM_getValue('detection_cache', {});
                all[mid] = this.cache.get(mid);
                GM_setValue('detection_cache', all);
            } catch (e) {}
        }

        loadPersistedCache() {
            try {
                const saved = GM_getValue('detection_cache', {});
                for (const [mid, data] of Object.entries(saved)) {
                    if (Date.now() - data.timestamp < CONFIG.CACHE_EXPIRE) this.cache.set(mid, data);
                }
            } catch (e) {}
        }

        persistCache() {
            try {
                const obj = {};
                for (const [mid, data] of this.cache.entries()) obj[mid] = data;
                GM_setValue('detection_cache', obj);
            } catch (e) {}
        }

        async waitDelay() {
            const now = Date.now();
            // 限频未解冻则等待
            if (now < this.rateLimitUntil) {
                await new Promise(r => setTimeout(r, this.rateLimitUntil - now));
            }
            const wait = Math.max(0, CONFIG.REQUEST_DELAY - (Date.now() - this.lastRequestTime));
            if (wait > 0) await new Promise(r => setTimeout(r, wait));
            this.lastRequestTime = Date.now();
        }

        isDefaultAvatar(face) {
            if (!face) return true;
            return face.includes('noavatar') || face.includes('/0/0/0') || face.includes('default/face.png');
        }

        // 返回 { suspicion, reason }
        applyRules(r) {
            const { following, dynamic, bangumi, fav, isBiliPrefix } = r;
            const lowFollow = following <= RULES.followThreshold;

            // 构建统一的原因描述
            const parts = [`动态${dynamic}`, `追番${bangumi}`, `收藏${fav}`];
            if (isBiliPrefix) parts.push('bili_前缀');
            if (lowFollow) parts.push(`关注≤${RULES.followThreshold}`);
            const desc = parts.join('·');

            // bili_ 前缀 → 直接标 R
            if (isBiliPrefix) return { suspicion: 'high', reason: desc };

            // 有追番或收藏 → 活人信号
            if (bangumi > 0 || fav > 0) return { suspicion: 'none', reason: desc };

            // 动态≥5 → 活人
            if (dynamic >= 5) return { suspicion: 'none', reason: desc };

            // 动态1~4，无追番无收藏 → 少动态
            if (dynamic >= 1) return { suspicion: 'medium', reason: desc };

            // 动态=0，无追番无收藏 → 机器人
            return { suspicion: 'high', reason: desc };
        }

        // 单接口检测：动态接口必调；动态=0 才补查追番/收藏
        // domLevel: 从粉丝卡片 DOM 提取的等级（0 表示未取到）
        async detectUser(mid, fanFace, fanName, domLevel = 0) {
            const cached = this.getCached(mid);
            if (cached) return cached;

            const result = {
                mid, suspicion: 'none', reason: '', following: 0,
                dynamic: 0, bangumi: 0, fav: 0, level: domLevel,
                isDefaultAvatar: false, isBiliPrefix: false,
            };

            try {
                await this.waitDelay();
                const data = await API.getDynamic(mid);

                const items = data.items || data.data?.items || [];
                result.dynamic = items.length;

                let author = null;
                for (const it of items) {
                    if (it.modules?.module_author) { author = it.modules.module_author; break; }
                }
                const name = author?.name || fanName || '';
                const face = author?.face || fanFace || '';
                result.isBiliPrefix = name.startsWith('bili_');
                result.isDefaultAvatar = this.isDefaultAvatar(face);
                result.following = author?.following || 0;

                // 动态<5 才补查追番/收藏（节省请求）
                if (result.dynamic < 5) {
                    await this.waitDelay();
                    result.bangumi = await API.getBangumi(mid).catch(() => 0);
                    await this.waitDelay();
                    result.fav = await API.getFav(mid).catch(() => 0);
                }

                const ruled = this.applyRules(result);
                result.suspicion = ruled.suspicion;
                result.reason = ruled.reason;
            } catch (e) {
                if (e.message && (e.message.includes('-799') || e.message.includes('412'))) {
                    this.consecutiveFails++;
                    const backoff = Math.min(60000, CONFIG.RATE_LIMIT_DELAY * Math.pow(2, this.consecutiveFails - 1));
                    this.rateLimitUntil = Date.now() + backoff;
                }
                result.suspicion = 'pending';
            }

            this.setCache(mid, result);
            return result;
        }
    }

    // =====================================================================
    // UI 控制器
    // =====================================================================
    class UIController {
        constructor(engine) {
            this.engine = engine;
            this.panel = null;
            this.scannedMids = new Set();   // 挡重复请求（当前会话）
            this.countedMids = new Set();  // 挡重复统计（跨页累计，持久化）
            this.processing = false;
            this.isRunning = false;
            this.scanTimer = null;
            this.stats = { high: 0, medium: 0, scanned: 0, pending: 0 };
        }

        init() {
            this.createStyles();
            this.createPanel();
            this.bindEvents();
            // 点赞列表页：不执行 DOM 回填，等 scanLoveList 拉取
            if (!this.getDynamicIdFromHash()) {
                // 页面异步渲染，等一会再回填
                setTimeout(() => this.initialBackfill(), 2000);
            }
        }

        createStyles() {
            GM_addStyle(`
                #bilibili-fan-cleanup-panel {
                    position: fixed; top: 100px; right: 20px; width: 300px;
                    background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 14px; color: #333; overflow: hidden;
                }
                #bilibili-fan-cleanup-panel .header {
                    background: linear-gradient(135deg, #fb7299 0%, #fc9db9 100%); color: white;
                    padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;
                }
                #bilibili-fan-cleanup-panel .header h3 { margin: 0; font-size: 15px; font-weight: 600; }
                #bilibili-fan-cleanup-panel .header .minimize-btn {
                    background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0 8px; opacity: 0.8;
                }
                #bilibili-fan-cleanup-panel .body { padding: 14px 16px; }
                #bilibili-fan-cleanup-panel .stats { display: flex; gap: 8px; margin-bottom: 12px; }
                #bilibili-fan-cleanup-panel .stat-item { flex: 1; background: #f5f5f5; padding: 8px; border-radius: 8px; text-align: center; }
                #bilibili-fan-cleanup-panel .stat-item .number { font-size: 18px; font-weight: 700; color: #fb7299; }
                #bilibili-fan-cleanup-panel .stat-item .label { font-size: 11px; color: #666; margin-top: 2px; }
                #bilibili-fan-cleanup-panel .status { font-size: 12px; color: #999; margin-bottom: 12px; text-align: center; }
                #bilibili-fan-cleanup-panel .status.running { color: #fb7299; }
                #bilibili-fan-cleanup-panel .controls { display: flex; gap: 8px; }
                #bilibili-fan-cleanup-panel .controls button {
                    flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
                }
                #bilibili-fan-cleanup-panel .controls .start-btn { background: #fb7299; color: white; }
                #bilibili-fan-cleanup-panel .controls .start-btn:hover { background: #fc9db9; }
                #bilibili-fan-cleanup-panel .controls .start-btn.running { background: #ccc; }
                #bilibili-fan-cleanup-panel .controls .clear-btn { background: #f5f5f5; color: #666; font-size: 12px; }
                #bilibili-fan-cleanup-panel .controls .clear-btn:hover { background: #e8e8e8; color: #333; }
                .bilibili-fan-cleanup-tag {
                    display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 11px; font-weight: 700; margin-left: 6px; vertical-align: middle;
                }
                .bilibili-fan-cleanup-tag.robot { background: rgba(255,68,68,0.15); color: #ff4444; }
                .bilibili-fan-cleanup-tag.human { background: rgba(68,221,68,0.15); color: #44dd44; }
            `);
        }

        createPanel() {
            this.panel = document.createElement('div');
            this.panel.id = 'bilibili-fan-cleanup-panel';
            this.panel.innerHTML = `
                <div class="header">
                    <h3>你是入机吗？</h3>
                    <button class="minimize-btn">−</button>
                </div>
                <div class="body">
                    <div class="stats">
                        <div class="stat-item"><div class="number" id="stat-scanned">0</div><div class="label">已扫描</div></div>
                        <div class="stat-item"><div class="number" id="stat-high">0</div><div class="label">人机(R)</div></div>
                        <div class="stat-item"><div class="number" id="stat-medium">0</div><div class="label">少动态</div></div>
                        <div class="stat-item"><div class="number" id="stat-pending">0</div><div class="label">失败</div></div>
                    </div>
                    <div class="status" id="scan-status">点击开始检测</div>
                    <div class="controls">
                        <button class="start-btn" id="btn-start">开始检测</button>
                        <button class="clear-btn" id="btn-clear">清除缓存</button>
                    </div>
                </div>`;
            document.body.appendChild(this.panel);
        }

        bindEvents() {
            this.panel.querySelector('.minimize-btn').addEventListener('click', () => {
                const body = this.panel.querySelector('.body');
                const btn = this.panel.querySelector('.minimize-btn');
                const min = body.style.display === 'none';
                body.style.display = min ? 'block' : 'none';
                btn.textContent = min ? '−' : '+';
            });
            this.panel.querySelector('#btn-start').addEventListener('click', () => this.toggleScan());
            this.panel.querySelector('#btn-clear').addEventListener('click', () => {
                GM_setValue('detection_cache', {});
                this.engine.cache.clear();
                this.scannedMids.clear();
                this.stats = { high: 0, medium: 0, scanned: 0, pending: 0 };
                this.updateStats();
                this.setStatus('缓存已清除');
            });
        }

        updateStats() {
            document.getElementById('stat-scanned').textContent = this.stats.scanned;
            document.getElementById('stat-high').textContent = this.stats.high;
            document.getElementById('stat-medium').textContent = this.stats.medium;
            document.getElementById('stat-pending').textContent = this.stats.pending;
            // 持久化累计统计集合，跨页/刷新保留
            try { GM_setValue('counted_mids', Array.from(this.countedMids)); } catch (e) {}
        }

        loadCounted() {
            try {
                const arr = GM_getValue('counted_mids', []);
                this.countedMids = new Set(arr);
            } catch (e) {}
        }

        setStatus(text, running = false) {
            const el = document.getElementById('scan-status');
            el.textContent = text;
            el.className = 'status' + (running ? ' running' : '');
        }

        toggleScan() {
            const btn = this.panel.querySelector('#btn-start');
            if (this.isRunning) {
                this.stopScan();
                btn.textContent = '开始检测';
                btn.classList.remove('running');
                this.setStatus('已暂停');
            } else {
                this.startScan();
                btn.textContent = '停止检测';
                btn.classList.add('running');
                this.setStatus('扫描中...', true);
            }
        }

        startScan() {
            this.isRunning = true;
            this.scheduleNextScan();
        }

        stopScan() {
            this.isRunning = false;
            if (this.scanTimer) { clearTimeout(this.scanTimer); this.scanTimer = null; }
        }

        scheduleNextScan() {
            if (!this.isRunning) return;
            this.scanTimer = setTimeout(async () => {
                await this.scan();
                this.scheduleNextScan();
            }, CONFIG.SCAN_INTERVAL);
        }

        async scan() {
            if (this.processing) return;
            const dynamicId = this.getDynamicIdFromHash();

            // 点赞列表页：直接扫描 DOM（love-item 结构已提供）
            if (dynamicId) {
                this.processing = true;
                try {
                    const items = Array.from(document.querySelectorAll('.love-item'));
                    const CONCURRENCY = 3;
                    let idx = 0;
                    const worker = async () => {
                        while (idx < items.length) {
                            if (!this.isRunning) break;
                            const item = items[idx++];
                            const mid = this.extractMidFromLoveItem(item);
                            if (!mid) continue;
                            if (this.scannedMids.has(mid)) {
                                const cached = this.engine.getCached(mid);
                                if (cached) {
                                    const nameLink = item.querySelector('.love-item__uname');
                                    try { this.tagWithReason(nameLink || item.querySelector('a[href*="space.bilibili.com"]'), cached.suspicion, cached.reason || ''); } catch (e) {}
                                    if (!this.countedMids.has(mid)) {
                                        this.countedMids.add(mid);
                                        this.stats.scanned++;
                                        if (cached.suspicion === 'high') this.stats.high++;
                                        else if (cached.suspicion === 'medium') this.stats.medium++;
                                    }
                                }
                                continue;
                            }
                            this.scannedMids.add(mid);
                            const nameLink = item.querySelector('.love-item__uname');
                            await this.processElement(nameLink || item.querySelector('a[href*="space.bilibili.com"]') || item, mid);
                        }
                    };
                    const workers = [];
                    for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
                    await Promise.all(workers);
                } finally {
                    this.processing = false;
                }
                return;
            }

            this.processing = true;
            // 正常粉丝页扫描

            const nameElements = Array.from(document.querySelectorAll(
                '.u-name a, .user-name, .name, .uname, [class*="user"] a[href*="space.bilibili.com"]'
            ));

            // 并发上限，避免瞬时打爆接口
            const CONCURRENCY = 3;
            let idx = 0;
            const worker = async () => {
                while (idx < nameElements.length) {
                    if (!this.isRunning) break;
                    const el = nameElements[idx++];
                    const mid = this.extractMidFromElement(el);
                    if (!mid) continue;
                    // 缓存命中（内存或持久层）→ 直接打标签，不重复请求
                    const cached = this.engine.getCached(mid);
                    if (cached) {
                        this.scannedMids.add(mid);
                        try { this.tagWithReason(el, cached.suspicion, cached.reason || ''); } catch (e) {}
                        // 累计统计（避免重复计数：只在首次见到该 mid 时加）
                        if (!this.countedMids.has(mid)) {
                            this.countedMids.add(mid);
                            this.stats.scanned++;
                            if (cached.suspicion === 'high') this.stats.high++;
                            else if (cached.suspicion === 'medium') this.stats.medium++;
                            this.updateStats();
                        }
                        continue;
                    }
                    this.scannedMids.add(mid);
                    await this.processElement(el, mid);
                }
            };

            const workers = [];
            for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
            await Promise.all(workers);

            this.processing = false;
        }

        // 初始回填：脚本启动时，对缓存中已有结果的用户直接打标签（不发起任何 API 请求）
        initialBackfill() {
            // 点赞列表页 DOM
            const loveItems = document.querySelectorAll('.love-item');
            if (loveItems.length > 0) {
                let backfilled = 0;
                for (const item of loveItems) {
                    const link = item.querySelector('a[href*="space.bilibili.com"]');
                    if (!link) continue;
                    const m = link.href.match(/space\.bilibili\.com\/(\d+)/);
                    if (!m) continue;
                    const mid = m[1];
                    const cached = this.engine.getCached(mid);
                    if (!cached) continue;
                    this.scannedMids.add(mid);
                    const nameLink = item.querySelector('.love-item__uname');
                    try { this.tagWithReason(nameLink || link, cached.suspicion, cached.reason || ''); } catch (e) {}
                    if (!this.countedMids.has(mid)) {
                        this.countedMids.add(mid);
                        this.stats.scanned++;
                        if (cached.suspicion === 'high') this.stats.high++;
                        else if (cached.suspicion === 'medium') this.stats.medium++;
                    }
                    backfilled++;
                }
                this.updateStats();
                return;
            }
            // 粉丝页 DOM
            const nameElements = document.querySelectorAll(
                '.u-name a, .user-name, .name, .uname, [class*="user"] a[href*="space.bilibili.com"]'
            );
            let backfilled = 0;
            for (const el of nameElements) {
                const mid = this.extractMidFromElement(el);
                if (!mid) continue;
                const cached = this.engine.getCached(mid);
                if (!cached) continue;
                this.scannedMids.add(mid);
                try {
                    this.tagWithReason(el, cached.suspicion, cached.reason || '');
                } catch (e) {}
                if (cached.suspicion === 'high') this.stats.high++;
                else if (cached.suspicion === 'medium') this.stats.medium++;
                backfilled++;
            }
            this.stats.scanned += backfilled;
            this.updateStats();
        }

        async processElement(el, mid) {
            try {
                const domLevel = this.extractLevelFromElement(el);
                const result = await Promise.race([
                    this.engine.detectUser(mid, null, null, domLevel),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000)),
                ]);

                if (result.suspicion === 'pending') {
                    this.scannedMids.delete(mid);  // 失败待重试
                    this.stats.pending++;
                    this.updateStats();
                    return;
                }

                if (!this.countedMids.has(mid)) {
                    this.countedMids.add(mid);
                    this.stats.scanned++;
                }
                this.updateStats();

                this.tagWithReason(el, result.suspicion, result.reason);
                if (result.suspicion === 'high') this.stats.high++;
                else if (result.suspicion === 'medium') this.stats.medium++;
                this.updateStats();
            } catch (e) {
                this.scannedMids.delete(mid);
            }
        }

        extractMidFromElement(el) {
            if (el.tagName === 'A' && el.href && el.href.includes('space.bilibili.com')) {
                const m = el.href.match(/space\.bilibili\.com\/(\d+)/);
                if (m) return m[1];
            }
            const link = el.closest('a[href*="space.bilibili.com"]') || el.querySelector('a[href*="space.bilibili.com"]');
            if (link) {
                const m = link.href.match(/space\.bilibili\.com\/(\d+)/);
                if (m) return m[1];
            }
            const parent = el.closest('[data-mid], [data-user-id]');
            if (parent) return parent.getAttribute('data-mid') || parent.getAttribute('data-user-id');
            const container = el.closest('.card, .item, .user-info, .card-wrp, [class*="fan"]');
            if (container) {
                const avatarLink = container.querySelector('a[href*="space.bilibili.com"]');
                if (avatarLink) {
                    const m = avatarLink.href.match(/space\.bilibili\.com\/(\d+)/);
                    if (m) return m[1];
                }
            }
            return null;
        }

        // 从点赞列表项提取用户 mid（零请求）
        extractMidFromLoveItem(item) {
            const link = item.querySelector('a[href*="space.bilibili.com"]');
            if (!link) return null;
            const m = link.href.match(/space\.bilibili\.com\/(\d+)/);
            return m ? m[1] : null;
        }

        // 从粉丝卡片 DOM 提取等级（零请求）。B站 卡片里等级通常以 class 含 "level" 或文本形式存在
        extractLevelFromElement(el) {
            const container = el.closest('.card-wrp, .card, .item, [class*="fan"]') || el.parentElement;
            if (!container) return 0;
            // 尝试 class 中含 level 数字的模式，如 "level-6" / "lv-6"
            const lvlEl = container.querySelector('[class*="level-"], [class*="lv-"], .level, .user-level');
            if (lvlEl) {
                const cls = lvlEl.className.match(/level-?(\d+)/i) || lvlEl.className.match(/lv-?(\d+)/i);
                if (cls) return parseInt(cls[1], 10);
                const txt = (lvlEl.textContent || '').match(/(\d+)/);
                if (txt) return parseInt(txt[1], 10);
            }
            // 尝试文本 "Lv6" / "LV6"
            const m = container.textContent.match(/Lv\.?\s*(\d+)/i);
            if (m) return parseInt(m[1], 10);
            return 0;
        }

        // 从 URL hash 中提取动态号（适用于 message.bilibili.com/#/love/{动态号}）
        getDynamicIdFromHash() {
            // 支持 #/love/{id} 和 #/love/{id}?... 以及尾部斜杠
            const m = location.hash.match(/\/love\/(\d+)/);
            return m ? m[1] : null;
        }

        // 为点赞列表页面扫描点赞用户（使用点赞列表 API）
        async scanLoveList() {
            if (this.processing) return;
            const dynamicId = this.getDynamicIdFromHash();
            if (!dynamicId) {
                this.setStatus('未找到动态号');
                return;
            }
            this.processing = true;
            this.setStatus(`正在拉取动态 ${dynamicId} 的点赞列表...`, true);

            try {
                let pn = 1;
                let total = 0;
                let scanned = 0;
                const CONCURRENCY = 3;

                while (this.isRunning) {
                    const pageData = await API.getLikeList(dynamicId, pn, 20).catch(() => {
                        return { likes: [], hasMore: false, total: 0 };
                    });
                    total = pageData.total || total;

                    const likes = pageData.likes || [];
                    if (likes.length === 0) break;

                    // 并发处理当前页点赞用户
                    let idx = 0;
                    const worker = async () => {
                        while (idx < likes.length) {
                            if (!this.isRunning) break;
                            const user = likes[idx++];
                            const mid = user.mid;
                            if (!mid) continue;

                            // 缓存命中直接打标（不请求）
                            const cached = this.engine.getCached(mid);
                            if (cached) {
                                this.scannedMids.add(mid);
                                this.ensureLoveTag(mid, cached.suspicion, cached.reason || '');
                                if (!this.countedMids.has(mid)) {
                                    this.countedMids.add(mid);
                                    this.stats.scanned++;
                                    if (cached.suspicion === 'high') this.stats.high++;
                                    else if (cached.suspicion === 'medium') this.stats.medium++;
                                }
                                continue;
                            }

                            this.scannedMids.add(mid);
                            // 检测用户（使用点赞 API 返回的等级）
                            const result = await Promise.race([
                                this.engine.detectUser(mid, user.face, user.uname, user.level),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000)),
                            ]);

                            if (result.suspicion === 'pending') {
                                this.scannedMids.delete(mid);
                                this.stats.pending++;
                                continue;
                            }

                            if (!this.countedMids.has(mid)) {
                                this.countedMids.add(mid);
                                this.stats.scanned++;
                            }
                            this.ensureLoveTag(mid, result.suspicion, result.reason || '');
                            if (result.suspicion === 'high') this.stats.high++;
                            else if (result.suspicion === 'medium') this.stats.medium++;
                            scanned++;
                        }
                    };

                    const workers = [];
                    for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
                    await Promise.all(workers);

                    this.updateStats();
                    this.setStatus(`已扫描 ${scanned}/${total}（第 ${pn} 页）`, true);

                    if (!pageData.hasMore) break;
                    pn++;
                    // 页间延迟，避免限频
                    await new Promise(r => setTimeout(r, CONFIG.REQUEST_DELAY));
                }

                this.setStatus(`完成：共 ${total} 人，已扫描 ${scanned}`);
            } catch (e) {
                this.setStatus('扫描出错：' + e.message);
            } finally {
                this.processing = false;
            }
        }

        // 在点赞列表页面为用户打标签（无粉丝卡片 DOM，创建浮层标签）
        ensureLoveTag(mid, suspicion, reason) {
            const selectors = [
                `[data-mid="${mid}"]`,
                `[data-user-id="${mid}"]`,
                `.like-item[data-uid="${mid}"]`,
                `.user-item[data-mid="${mid}"]`,
            ];
            let node = null;
            for (const sel of selectors) {
                node = document.querySelector(sel);
                if (node) break;
            }
            if (!node) return;
            try {
                node.querySelectorAll('.bilibili-fan-cleanup-tag').forEach(t => t.remove());
                const map = { high: 'robot', medium: 'robot', none: 'human', pending: 'human' };
                const tagKey = map[suspicion] || 'human';
                const tag = TAGS[tagKey];
                const tagEl = document.createElement('span');
                tagEl.className = `bilibili-fan-cleanup-tag ${tagKey}`;
                tagEl.textContent = ` 【 ${tag.text} | ${reason} 】`;
                const nameEl = node.querySelector('.uname, .user-name, .name, [class*="name"]') || node;
                nameEl.appendChild(tagEl);
            } catch (e) {}
        }

        // 带原因打标（插入到用户名链接旁边）
        tagWithReason(element, suspicion, reason) {
            const map = { high: 'robot', medium: 'robot', none: 'human', pending: 'human' };
            const tagKey = map[suspicion] || 'human';
            const tag = TAGS[tagKey];
            if (!tag) return;
            try {
                element.querySelectorAll('.bilibili-fan-cleanup-tag').forEach(t => t.remove());
                const tagEl = document.createElement('span');
                tagEl.className = `bilibili-fan-cleanup-tag ${tagKey}`;
                tagEl.textContent = ` 【 ${tag.text} | ${reason} 】`;
                element.appendChild(tagEl);
            } catch (e) {}
        }
    }

    // =====================================================================
    // 启动
    // =====================================================================
    const engine = new DetectionEngine();
    engine.loadPersistedCache();
    const ui = new UIController(engine);
    ui.init();
    window.addEventListener('beforeunload', () => engine.persistCache());

})();
