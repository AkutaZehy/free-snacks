# Free Snacks

<p align="center">
  <img src="https://img.shields.io/github/license/AkutaZehy/free-snacks" alt="MIT License">
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?logo=windows" alt="Platform: Windows">
  <img src="https://img.shields.io/badge/AI-Assisted-8A2BE2" alt="AI Assisted">
  <img src="https://img.shields.io/github/stars/AkutaZehy/free-snacks?style=flat&logo=github" alt="GitHub Stars">
</p>

Warning: This repository does not provide README in **any** other languages ​​(such as English). Please use translation software on your own.

## 说明

这是一个简单的项目，用于存储一些有用的快速和小型的 shell 脚本、自己编写的一些小工具，可以用于一些 Windows 上的任务。

## 脚本列表

```bash
📁 src/
├── shutdown.bat        # 关闭计算机（谨慎使用）
├── clean_disk.bat      # 清理C盘缓存
├── restart_dwm.bat     # 重启DWM（用于解决Win10 DWM卡顿）
├── gitbruh.bat         # BRUH Commit，快速提交Git代码
│                       # 需配合 resources/sentenses.txt 使用
├── remove_znkt.bat     # 移除〇〇网盘的智能看图
└── dosdel.bat          # 强制删除文件/目录
```

附注：

- clean_disk：最早出处不明。
- remove_znkt：原作者 [Xzonn](https://xzonn.top/posts/Remove-Intelligent-Image-Viewer.html)。
- dosdel：突破权限、长路径（>260字符）及 DOS 保留名（如 `NUL`、`LPT1` 等）限制，移除在 Win32 API 下无法被直接删除的文件；文件被占用时无效。

## 工具列表~~Wheel Builds~~

<details>
<summary><strong><a href="https://github.com/AkutaZehy/color-compass">Color Compass</a></strong> — 轻量级调色板提取工具，3D 色彩空间可视化</summary>

 ![](https://img.shields.io/badge/stack-Three.js-blue) ![](https://img.shields.io/badge/AI-Gemini_Pro_2.5-8A2BE2) ![](https://img.shields.io/badge/2025.06-888888)

色板算法改自 [Color Thief](https://github.com/lokesh/color-thief)，为其引入了降采样和二阶段聚类。~~然而效果好像还没 color-thief 好~~

色球部分灵感来源于[大佬们的配色都有啥秘密](https://www.bilibili.com/video/BV19T421671a/)，把 HSL 空间改为了对人眼更准确的 LAB 空间。

btw 目前算法里面超像素相关的部分是坏的但是懒得再改了。

</details>

<details>
<summary><strong><a href="https://github.com/AkutaZehy/Annoti">Annoti</a></strong> — 阅读批注工具</summary>

![](https://img.shields.io/badge/status-v1.0.0__dev-orange) ![](https://img.shields.io/badge/stack-Vue_3+Tauri_2+SQLite-0052CC) ![](https://img.shields.io/badge/AI-MiniMax--M2.5-8A2BE2) ![](https://img.shields.io/badge/2025.12-888888)

灵感主要来自于自己纸质阅读的批注，贴便利贴那种感觉。

其实单纯使用的话 MS Word 的"审阅"功能就是我想要的，不过这玩意太重了+PDF 批注又要 Arcobat。

另外 [Koodo](https://github.com/koodo-reader/koodo-reader) 这个也是开源的试过还不错，略卡别的还好。

旧版本参见 [Annoti-AI-exp](https://github.com/AkutaZehy/Annoti-AI-exp)。该项目也是我第一次大面积在本地使用 AI Agent 进行开发。

</details>

<details>
<summary><strong><a href="https://github.com/AkutaZehy/blocky-markdown">blocky-markdown</a>（⭐）</strong> — 类 Gutenburg 块级 Markdown 编辑器</summary>

![](https://img.shields.io/badge/status-v1.0.0__release-brightgreen) ![](https://img.shields.io/badge/stack-pure_frontend+Marked.js-0052CC) ![](https://img.shields.io/badge/AI-Copilot_Sonnet_4.5-8A2BE2) ![](https://img.shields.io/badge/2025.10-888888)

灵感主要来自于自己写 Jeykll 日记，准确来说是用的 Chirpy 不过无伤大雅都是 Liquid。

无论 VSCode 还是 Typora 还是太麻烦了想着自己做一个；

另外一个为什么说 WordPress 呢，其实 WP 的 Gutenberg 还是蛮好用的，但是要联网加上卡到飞起的体验让我不得不想整一个本地的编辑器 lmao。

> Blocky Markdown 的混合数据结构是一种"以空间换时间"且"以空间换清晰度"的设计。它巧妙地结合了数组的随机访问能力和链表的天然相邻关系，并通过重建链表来保证一致性，在满足所有核心需求的同时，保持了代码的可维护性。相比于传统单一结构，它更贴合块级编辑器的交互特点，是一种有特色的实用折衷。
>
> ——Deepseek V3.2 对我设计的神秘数据结构如此评价

这个做完了我是真心喜欢，有啥想法也也欢迎提 issue（虽然不一定做就是了）

</details>

<details>
<summary><strong><a href="https://github.com/AkutaZehy/key-statics">key-statics</a></strong> — 键盘输入可视化叠加层（OBS 集成）</summary>

![](https://img.shields.io/badge/status-v1.0.0__release-brightgreen) ![](<https://img.shields.io/badge/stack-Qt_6(C++17)-0052CC>) ![](https://img.shields.io/badge/AI-OpenCode+MiniMax--M2.5-8A2BE2) ![](https://img.shields.io/badge/2026.02-888888)

灵感主要来自 [KeyboardOverlay](https://github.com/tiger2005/KeyboardOverlay)，但它的问题在于位于前台，不是很爽。学习了 [Now Playing](https://github.com/Widdit/now-playing-service)，使用后端监听并用 HTTP Server 渲染就好办了。

说起来也比较好玩，自己完整构建的第一个 Qt 应用，但其实自己不太能看懂 C++。~~能用就行~~

另外算法上，KPS 采用了指数移动平均（EMA），适用于 OSU 等音游。公式为：

$$
KPS_{ema} = \alpha \cdot KPS_{instant} + (1-\alpha) \cdot KPS_{ema,prev}
$$

</details>

<details>
<summary>
其他的一些没啥用的轮子
</summary>

| 标题                                                         | 简介                                                                                                                               | 信息                                                                                                                                                                                                                                    | 附注                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| <a href="https://github.com/AkutaZehy/srt2sub">SRT2SUB</a>   | forked from [srt-to-AfterEffects-Captions](https://github.com/Slayemus/srt-to-AfterEffects-Captions)<br>对算法稍作改进以加速渲染。 | ![](https://img.shields.io/badge/stack-HTML5-blue) ![](https://img.shields.io/badge/2025.08-888888)                                                                                                                                     | 还是使用 [Aegisub](https://aegisub.org/) 吧。     |
| <a href="https://github.com/AkutaZehy/WaveGenQ">WaveGenQ</a> | 音频波形图生成工具                                                                                                                 | ![](https://img.shields.io/badge/status-V1.0.0-brightgreen) ![](https://img.shields.io/badge/stack-HTML5-blue) ![](https://img.shields.io/badge/AI-Copilot_Sonnet_4.5-8A2BE2) ![](https://img.shields.io/badge/2025.11-888888)          |
| <a href="https://github.com/AkutaZehy/GitGUI">GitGUI</a>     | Git+GUI                                                                                                                            | ![](https://img.shields.io/badge/status-v1.2.0__release-brightgreen) ![](https://img.shields.io/badge/stack-Wails_v2-0052CC) ![](https://img.shields.io/badge/AI-MiniMax--M2.5-8A2BE2) ![](https://img.shields.io/badge/2026.03-888888) | 推荐 [Sourcetree](https://www.sourcetreeapp.com/) |

</details>

~~因为实在是看 nodejs 这种重量级不顺眼~~

所以有些纯前端，可以用 file 协议打开使用（浏览器直接开 index.html 就行）；有些存在跨域问题的（比如 Color Compass）可以用 [Live Server](https://github.com/tapio/live-server) 开，这个是 VS Code 的插件。

如果试过了这些库中的某些并且觉得还可以的话欢迎加 Star，当然白嫖也没关系请遵守开源协议\*v-
