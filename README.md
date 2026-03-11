# Free Snacks

Warning: This repository does not provide README in **any** other languages ​​(such as English). Please use translation software on your own.

## 说明

这是一个简单的项目，用于存储一些有用的快速和小型的shell脚本、自己编写的一些小工具，可以用于一些Windows上的任务。

## 脚本列表

| 脚本名称        | 说明                   | 注释                                                                                       |
| --------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| shutdown.bat    | 关闭计算机             | 谨慎使用                                                                                   |
| clean_disk.bat  | 清理C盘缓存            | 不知道从哪里整来的实用小脚本                                                               |
| restart_dwm.bat | 重启DWM                | 用于解决Windows 10的DWM卡顿问题                                                            |
| gitbruh.bat     | *BRUH* Commit          | 用于快速提交Git代码                                                                        |
| remove_znkt.bat | 移除〇〇网盘的智能看图 | 致谢：[Xzonn](https://xzonn.top/posts/Remove-Intelligent-Image-Viewer.html) （未授权搬运） |

gitbruh.bat使用需要配合resources/sentenses.txt文件，里面存储了一些提交信息的句子。

## 工具列表~~Wheel Builds~~

| 工具列表（含链接） | 说明 | 状态 | 架构 | AI使用情况 | AI | 工具构建时间 |
| --- | --- | --- | --- | --- | --- | --- |
| [Color Compass](https://github.com/AkutaZehy/color-compass) | 轻量级、用户友好的工具，旨在从图像中提取调色板，并以3D形式可视化色彩空间。 | 可能有应用方向，Demo，停滞。 | 纯前端（HTML+CSS+JS）+[Three.js](https://github.com/mrdoob/three.js) | 核心算法由自己提出，实际编写交由AI。 | Gemini Pro 2.5 | 2025.06 |
| [SRT2SUB](https://github.com/AkutaZehy/srt2sub) | 用于将*.srt字幕渲染到Adobe After Effects中的文本层。 | 其实没啥用0.0 | 纯前端（HTML+JS） | 未使用AI。 | / | 2025.08 |
| [Annoti](https://github.com/AkutaZehy/Annoti) | 一个阅读的工具，主要用于阅读时批注的需求。 | v1.0.0 dev | Vue 3+Tauri 2+SQLite | 核心算法由自己提出，实际编写交由AI Agent。 | Claude Code Router + MiniMax-M2.1 | 2025.12 |
| [blocky-markdown](https://github.com/AkutaZehy/blocky-markdown) | 一个极简主义的Markdown编辑器，具有基于块的界面，提供与WordPress类似的编辑体验。 | v1.0.0 release | 纯前端（HTML+CSS+JS）+[Marked.js](https://github.com/markedjs/marked) | 核心算法由自己提出，实际编写交由AI Agent。 | Copilot coding agent(Github, Claude Sonnet 4.5) | 2025.10 |
| [WaveGenQ](https://github.com/AkutaZehy/WaveGenQ) | 从音频文件快速生成波形图像，并可自定义颜色和透明背景。 | V1.0.0 | 纯前端（HTML+CSS+JS） | 完全AI生成。 | Copilot coding agent(Github, Claude Sonnet 4.5) | 2025.11 |
| [key-statics](https://github.com/AkutaZehy/key-statics) | 轻量级Windows桌面应用程序，后端监听全局键盘输入并通过HTTP Server显示虚拟键盘叠加层，适用于桌面端OBS Browser Source集成设计。 | v1.0.0 release | Qt 6(C++17) | 核心算法由自己提出，实际编写交由AI Agent。 | OpenCode+ MiniMax-M2.5 | 2026.02 |
| [GitGUI](https://github.com/AkutaZehy/GitGUI) | Git 桌面版 | v1.2.0 release | 后端Wails v2 (Go + WebView) <br>前端React + TS | 核心算法由自己提出，实际编写交由AI Agent。 | OpenCode+ MiniMax-M2.5 | 2026.03 |

~~因为实在是看nodejs这种重量级不顺眼~~

所以有些纯前端，可以用file协议打开使用（浏览器直接开index.html就行）；另外也可以用[Live Server](https://github.com/tapio/live-server)开，这个是VS Code的插件。

如果试过了这些库中的某些并且觉得还可以的话欢迎加Star，当然白嫖也没关系请遵守开源协议*v-



下面是具体的简介~~我在说什么~~：

### Color Compass

色板算法改自[Color Thief](https://github.com/lokesh/color-thief)，为其引入了降采样和二阶段聚类。~~然而效果好像还没color-thief好~~

色球部分灵感来源于[大佬们的配色都有啥秘密](https://www.bilibili.com/video/BV19T421671a/)，把HSL空间改为了对人眼更准确的LAB空间。

btw目前算法里面超像素相关的部分是坏的但是懒得再改了。

### SRT2SUB

forked from [srt-to-AfterEffects-Captions](https://github.com/Slayemus/srt-to-AfterEffects-Captions)，对算法稍作改进以加速渲染。

~~纯闲的.jpg~~字幕软件千千万，是[Aegisub](https://aegisub.org/)不好用了吗，做这种低级的版本其实真轮不上AE。

### Annoti

灵感主要来自于自己纸质阅读的批注，贴便利贴那种感觉。

其实单纯使用的话MS Word的“审阅”功能就是我想要的，不过这玩意太重了+PDF批注又要Arcobat。

另外[Koodo](https://github.com/koodo-reader/koodo-reader)这个也是开源的试过还不错，略卡别的还好。

旧版本参见[Annoti-AI-exp](https://github.com/AkutaZehy/Annoti-AI-exp)。该项目也是我第一次大面积在本地使用AI Agent进行开发。

### blocky-markdown

灵感主要来自于自己写Jeykll日记，准确来说是用的Chirpy不过无伤大雅都是Liquid。

无论VSCode还是Typora还是太麻烦了想着自己做一个；

另外一个为什么说WordPress呢，其实WP的Gutenberg还是蛮好用的，但是要联网加上卡到飞起的体验让我不得不想整一个本地的编辑器lmao。

> Blocky Markdown  的混合数据结构是一种“以空间换时间”且“以空间换清晰度”的设计。它巧妙地结合了数组的随机访问能力和链表的天然相邻关系，并通过重建链表来保证一致性，在满足所有核心需求的同时，保持了代码的可维护性。相比于传统单一结构，它更贴合块级编辑器的交互特点，是一种有特色的实用折衷。
>
> ——Deepseek V3.2对我设计的神秘数据结构如此评价

这个做完了我是真心喜欢，有啥想法也也欢迎提issue（虽然不一定做就是了）

### WaveGenQ

一个用于生成音频波形图片的工具。

### key-statics

灵感主要来自[KeyboardOverlay](https://github.com/tiger2005/KeyboardOverlay)，但它的问题在于位于前台，不是很爽。学习了[Now Playing](https://github.com/Widdit/now-playing-service)，使用后端监听并用HTTP Server渲染就好办了。

说起来也比较好玩，自己完整构建的第一个Qt应用，但其实自己不太能看懂C++。~~能用就行~~

另外算法上，KPS采用了指数移动平均（EMA），适用于OSU等音游。公式为：

$$
KPS_{ema} = \alpha \cdot KPS_{instant} + (1-\alpha) \cdot KPS_{ema,prev}
$$

### GitGUI

一个非常好懂的名字，就是Git+GUI，因为Git Desktop有时候还是不大好用（功能太多了有点）。

在想有没有既不用Obj C/CPP（Qt）/.NET的方案（拿微软没辙了），又不用electron的。Flutter开发实在不太满意，写起来有点不爽；Tauri的Rust编译起来还是有点太慢了，而且其他弊病不小。

于是又找到了Wails，使用Go后端，这是第一个Wails应用。

因为前端可以WebView+React所以没啥大毛病，Go除了语法抽象了点确实是个好语言。<s>`if err != nil`笑死</s>
