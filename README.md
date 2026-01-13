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

## 工具列表

| 工具列表（含链接） | 说明 | 状态 | 架构 | AI使用情况 | AI | 其他说明 |
| --- | --- | --- | --- | --- | --- | --- |
| [Color Compass](https://github.com/AkutaZehy/color-compass)<sup>1</sup> | 轻量级、用户友好的工具，旨在从图像中提取调色板，并以3D形式可视化色彩空间。 | 可能有应用方向，Demo，停滞 | 纯前端（html+css+js）+[Three.js](https://github.com/mrdoob/three.js)<sup>2</sup> | 核心算法由自己提出，实际编写交由AI | Gemini Pro 2.5 | 色板算法改自[Color Thief](https://github.com/lokesh/color-thief)，为其引入了降采样和二阶段聚类。 <br>色球部分灵感来源于[大佬们的配色都有啥秘密](https://www.bilibili.com/video/BV19T421671a/)，把HSL空间改为了对人眼更准确的LAB空间。 |
| [SRT2SUB](https://github.com/AkutaZehy/srt2sub)<sup>3</sup> | 用于将*.srt字幕渲染到Adob​​e After Effects中的文本层。 | 其实没啥用0.0 | 纯前端（html+js） | 未使用AI | / | forked from [srt-to-AfterEffects-Captions](https://github.com/Slayemus/srt-to-AfterEffects-Captions)，对算法稍作改进以加速渲染。 |
| [Annoti](https://github.com/AkutaZehy/Annoti)<sup>4</sup> | 一个阅读的工具，主要用于阅读时批注的需求。 | v1.0.0 dev | Vue 3+Tauri 2+SQLite | 核心算法由自己提出，实际编写交由AI Agent。 | Claude Code Router + MiniMax-M2.1(chatcompletion-v2) | 旧版本参见[Annoti-AI-exp](https://github.com/AkutaZehy/Annoti-AI-exp)。<br>该项目也是我第一次大面积在本地使用AI Agent进行开发。 |
| [blocky-markdown](https://github.com/AkutaZehy/blocky-markdown)<sup>5</sup> | 一个极简主义的Markdown编辑器，具有基于块的界面，提供与WordPress类似的编辑体验。 | v1.0.0 release | 纯前端（html+css+js）+[Marked.js](https://github.com/markedjs/marked) | 核心算法由自己提出，实际编写交由AI Agent。 | Copilot coding agent(Github, Claude Sonnet 4.5) | 基本功能差不多了，有建议可以提issue。 |
| [WaveGenQ](https://github.com/AkutaZehy/WaveGenQ) | 从音频文件快速生成波形图像，并可自定义颜色和透明背景。 | V1.0.0 | 纯前端（html+css+js） | 完全AI生成 | Copilot coding agent(Github, Claude Sonnet 4.5) | 有点忘了，总之写出来丢这了就没咋用过。 |

如果试过了这些库中的某些并且觉得还可以的话欢迎加Star，当然白嫖也没关系请遵守开源协议*v-

其他备注和碎碎念时间：

1. 我觉着这个蛮好的，尤其是color-thief的Median Cut和HSL读图的理解很精彩。<br>
btw目前算法里面超像素相关的部分是坏的但是懒得再改了。
2. ~~因为实在是看vue/react这种重量级不顺眼，像tauri/svelte的开发体验也没好哪去~~<br>
基本上都是纯前端，可以用file协议打开使用（浏览器直接开index.html就行）；另外也可以用[Live Server](https://github.com/tapio/live-server)开，这个是VS Code的插件。
3. 纯闲的.jpg<br>
字幕软件千千万，是[Aegisub](https://aegisub.org/)不好用了吗，做这种低级的版本其实真轮不上AE。
4. 灵感主要来自于自己纸质阅读的批注，贴便利贴那种感觉。<br>
其实单纯使用的话MS Word的“审阅”功能就是我想要的，不过这玩意太重了+PDF批注又要Arcobat；<br>
另外[Koodo](https://github.com/koodo-reader/koodo-reader)这个也是开源的试过还不错，略卡别的还好。
5. 灵感主要来自于自己写Jeykll日记，准确来说是用的Chirpy不过无伤大雅都是Liquid。<br>
一方面自己比较喜欢往表格里面塞链接，就像现在你在free-snacks里现在看到的这样，无论VSCode还是Typora还是太麻烦了想着自己做一个；<br>
另外一个为什么说WordPress呢，其实WP还是蛮好用的我是真心喜欢Gutenberg，但是要联网加上卡到飞起的体验让我不得不想整一个本地的编辑器lmao。
