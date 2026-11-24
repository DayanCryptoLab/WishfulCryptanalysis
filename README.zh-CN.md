**[项目主页](https://dayancryptolab.github.io/WishfulCryptanalysis/?lang=zh)**

# 许愿式密码分析

**清华大学大衍密码学实验室**

降轮 AES 和 Keccak 挑战的实证记录。

[网站源码](docs/) · [天问 Agent](#天问-agent) · [AES 挑战](#aes-挑战) · [Keccak 排行榜](#keccak-挑战) · [核验结果](#核验结果) · [引用](#引用)

在本地检出仓库后，打开 `docs/index.html` 即可预览研究网站。交互式 AES 排行榜位于 `docs/aes.html`。

根据[项目许可证](LICENSE)，本项目原创内容可用于非商业目的，包括使用、修改和再分发。商业使用须事先取得书面许可。第三方材料沿用其原有条款。

> **主要结果**
>
> AES-128-MMO 的半自由起始碰撞达到 **7 轮**，固定 IV 碰撞达到 **6 轮**。宽度为 800 比特的 Keccak 碰撞达到官方排行榜的 **6 轮**。宽度为 200 比特的 Keccak 竞赛原像长度为 **477 比特**，短于此前公布的 517 比特。

## 天问 Agent

天问 Agent 正在进行内部测试，也在与其他团队联合测试。我们计划近期发布。

发布版计划支持使用自己的 API 密钥在本地运行，以 GLM 为接入示例。我们也计划支持通过配置 API 基础地址和模型名称，接入其他兼容 OpenAI 接口的服务商。

1. 配置所选服务商的 API 密钥。
2. 在本地启动 Agent，打开 Web 面板。
3. 运行随附示例，查看 Agent 的提案和独立核验结果。

[天问 Agent 框架概览](agent-framework/README.zh-CN.md)

## AES 挑战

这些 AES 变体沿用标准密钥编排和 128 比特分组长度，最后一轮省略 MixColumns。**半自由起始**（SFS）允许两个输入共享一个自由选择的 IV。**固定 IV** 由挑战预先指定。仓库中的测试使用全零 IV（`ZERO-IV`）和该挑战专用的公开 IV（`AES-CRUNCHY-v1`）。

既有实证结果栏列出引用资料中有已完成实验或具体实例支持的最高可比轮数。破折号表示所列资料缺少相应证据。耗时来自各自硬件上的原始运行。**本仓库已验证**指对随附固定输入的独立核验。

### Davies–Meyer 碰撞

消息分组用作 AES 密钥。双分组挑战要求两个输入的第一分组链接值先分离，再在第二分组收敛。

| 挑战 | 实例 | 既有实证结果 | 本仓库已验证 |
| :--- | :--- | :--- | :--- |
| **1A · 半自由起始** | AES-128-DM | **3 轮**，一对全零 IV 碰撞也满足半自由起始条件。[Qin、Bi 和 Dong，CRYPTO 2025][qbd-zero] | **6 轮**，笔记本电脑上耗时 308 秒（`1A-5`）。5 轮耗时 0.625 秒（`1A-3`） |
| **1A · 半自由起始** | AES-192-DM | **7 轮**，单个 CPU 核心耗时数分钟。[Qin、Bi 和 Dong，CRYPTO 2025][qbd-experiments] | — |
| **1A · 半自由起始** | AES-256-DM | **9 轮**，公布的碰撞对耗时 12 小时。[Taiyama 等，ASIACRYPT 2024][taiyama] | — |
| **1B · 单分组，固定 IV** | AES-128-DM | **3 轮**，全零 IV，有公开碰撞对。[Qin、Bi 和 Dong，CRYPTO 2025][qbd-zero] | **3 轮**，0.64 毫秒（`ZERO-IV`，`1B-2`）和 2.65 毫秒（`AES-CRUNCHY-v1`，`1B-3`） |
| **1B · 单分组，固定 IV** | AES-192-DM | **5 轮**，固定目标，单个 CPU 核心耗时数分钟。[Qin、Bi 和 Dong，CRYPTO 2025][qbd-experiments] | — |
| **1B · 单分组，固定 IV** | AES-256-DM | **6 轮**，固定目标，单个 CPU 核心耗时数分钟。[Qin、Bi 和 Dong，CRYPTO 2025][qbd-experiments] | — |
| **1C · 双分组，固定 IV** | AES-128-DM | — | **4 轮**，589.784 秒（`ZERO-IV`，`1C-1`）和 157.012 秒（`AES-CRUNCHY-v1`，`1C-2`） |

随附的两轮 `ZERO-IV` 基线（`1B-1`）来自 Taiyama 等人 2026 年论文表 12 中的实例。[IACR Communications in Cryptology][taiyama-vector]

### Matyas–Meyer–Oseas 碰撞

链接值用作 AES 密钥。固定 IV 挑战接受等长输入，每个输入包含一个或两个分组。

| 挑战 | 实例 | 既有实证结果 | 本仓库已验证 |
| :--- | :--- | :--- | :--- |
| **2A · 半自由起始** | AES-128-MMO | **6 轮**，有具体碰撞对。[Dong、Guo、Li 和 Pham，CRYPTO 2022][dglp] | **7 轮**，9.172 秒（`2A-2`）。6 轮耗时 1.55 秒（`2A-1`） |
| **2B · 固定 IV** | AES-128-MMO | — | 使用 `AES-CRUNCHY-v1` 达到 **6 轮**（`2B-4`，分布式运行中找到结果的任务耗时 99.62 秒）。**5 轮**分别耗时 0.052 秒（`AES-CRUNCHY-v1`，`2B-2`）和 23.518 秒（`ZERO-IV`，`2B-3`） |

### 单密钥恢复

两个 AES-128 赛道均要求在查询预算内通过选择明文恢复完整密钥。完整轮密钥可确定 AES-128 主密钥。下表为文献基线。

| 挑战 | 查询预算 | 既有实证结果 |
| :--- | :--- | :--- |
| **3A · 实用数据量** | 最多 2³⁴ 个选择明文 | **6 轮**，使用 3 × 2³² 次查询恢复完整密钥，在 6 台四核电脑上平均耗时 11.5 天。[Aldà、Aragona、Nicolodi 和 Sala，表 2][alda] |
| **3B · 超低数据量** | 最多 16 个选择明文 | **3 轮**，使用 4 个选择明文恢复完整的末轮轮密钥，文献报告在笔记本电脑上几乎瞬间完成。[Grassi 和 Schofnegger，INDOCRYPT 2020][grassi] |

## Keccak 挑战

状态宽度为 `b`，容量为 160 比特，速率为 `r = b − 160`。`start` 是从零开始计数的首轮索引。官方竞赛采用 160 比特碰撞摘要和 80 比特原像目标。[Keccak 团队的规则和结果][keccak]

### 碰撞排行榜

| 宽度 / 速率（比特） | 既有官方实证结果 | 本仓库已验证 |
| :--- | :--- | :--- |
| **200 / 40** | **2 轮**，Andreas Westfeld（2023 年）。[提交记录][k-c200] | **2 轮**，起始轮为 3 和 9。起始轮为 9 的碰撞对在全部 200 个状态比特上相同 |
| **400 / 240** | **5 轮**，Stefan Kölbl（2026 年）。[提交记录][k-c400] | — |
| **800 / 640** | **5 轮**，Qiao、Song、Liu 和 Guo（2016 年）。[提交记录][k-c800] | **6 轮**，起始轮为 14，两条消息均为 638 比特。在 1,000 个 CPU 核心上耗时约 16 小时。[官方提交，2026 年 11 月][k-here800] |
| **1600 / 1440** | **6 轮**，Song、Liao 和 Guo（2017 年），起始轮为 0。[提交记录][k-c1600] | **6 轮**，起始轮为 0 和 18，每对的两条消息均为 1,438 比特，耗时分别为 104.626 秒和 146.579 秒 |

<details>
<summary>碰撞测试数据与核验范围</summary>

[记录的 23 对碰撞](hash-challenge/collision_witnesses.json)覆盖宽度 200 的两轮、宽度 800 的 3 至 6 轮，以及宽度 1600 的 5 至 6 轮。每组测试数据均列出起始轮、两条消息的长度、预期摘要和来源记录。宽度 200、两轮、从第 9 轮开始的碰撞对，以及宽度 1600、五轮、从第 0 轮开始、消息长 2,878 比特的碰撞对，也通过了完整状态相等检查。

宽度 800、五轮、从第 0 轮开始、消息长 1,278 比特的碰撞对耗时 9.443 毫秒。宽度 1600、五轮、从第 0 轮开始、消息长 1,438 和 2,878 比特的碰撞对分别耗时 0.899 毫秒和 0.187 毫秒。

</details>

### 原像排行榜

| 宽度 / 速率（比特） | 官方最佳实证结果 | 本仓库在竞赛轮窗口内已验证 |
| :--- | :--- | :--- |
| **200 / 40** | **2 轮**，起始轮为 3，长度为 517 比特。Lin、Yu、Lu 和 Shen（2023 年）。[提交记录][k-p200] | **2 轮**，起始轮为 3，相同目标 `024a5518e1e95db53219` 的原像为 **477 比特** |
| **400 / 240** | **4 轮**，Lin、Yu、Ren、Lu 和 Shen（2024 年）。[提交记录][k-p400] | — |
| **800 / 640** | **5 轮**，Lin、Yu、Dong、Wu 和 Shen（2025 年），27 个分组。[公告][k-p800] | — |
| **1600 / 1440** | **4 轮**，Liu 和 Guo（2016 年），长度为 2,878 比特。[提交记录][k-p1600] | — |

<details>
<summary>扩展轮窗口与部分匹配实验</summary>

| 配置 | 已核验结果 |
| :--- | :--- |
| **200 比特宽度 · 3 轮 · 起始轮 93** | 与目标 `d8ed85692afbee4c99ce` 完全匹配的 398 比特零 IV 消息。轮窗口为 93–95，超出竞赛规定的起始轮范围 0–15 |
| **1600 比特宽度 · 5 轮 · 起始轮 0** | 五条 1,438 比特消息部分匹配目标 `653bc0f87d264f0857d0`。总匹配数最多为 80 比特中的 65 比特，最长匹配前缀为 34 比特，来自不同样本 |
| **1600 比特宽度 · 5 轮 · 起始轮 73** | 一条 5,758 比特消息在扩展轮窗口内完全匹配目标 `653bc0f87d264f0857d0`。归档的四个容量部分非零的内部状态也可在原始置换下复现目标。原基准报告给出了 45 个此类状态 |

[原像测试数据](hash-challenge-Preimage/results.json)包含完整消息、按 Keccak 最低有效位优先顺序表示的部分匹配，以及原始状态。核验程序分别按各自的条件检查这三种记录。

</details>

## 核验结果

在仓库根目录运行以下命令，需要 Python 3 和支持 C++17 的编译器。核验使用随附输入，可离线完成。

```sh
verify_dir=$(mktemp -d) &&
c++ -std=c++17 -O2 -Ihash-challenge/vendor \
  hash-challenge/verify_crunchy.cpp hash-challenge/vendor/*.cpp \
  -o "$verify_dir/verify_crunchy" &&
python3 -E -B hash-challenge/verify_results.py "$verify_dir/verify_crunchy" &&
python3 -E -B hash-challenge-Preimage/verify_results.py "$verify_dir/verify_crunchy" &&
python3 -E -B aes-challenge/verify_all_results.py
```

| 核验项目 | 预期结果 | 输入 |
| :--- | :--- | :--- |
| Keccak 碰撞 | **23 对**，包括 2 对全状态碰撞 | [碰撞测试数据](hash-challenge/collision_witnesses.json) |
| Keccak 原像 | **12 项**，包括 3 条完整消息、5 组部分匹配和 4 个原始状态 | [原像测试数据](hash-challenge-Preimage/results.json) |
| AES 碰撞 | **16 对**和 3 个 FIPS 197 已知答案测试向量 | [AES 测试数据和程序](aes-challenge/verify_all_results.py) |

<details>
<summary>cryptAnalysisAgent 论文测试数据索引</summary>

论文中的固定输入位于各挑战的测试数据中。可用以下编号在核验输出中查找。

| 论文结果 | 测试数据编号 |
| :--- | :--- |
| Keccak，宽度 200，两轮全状态碰撞 | `b200-2r-s09` |
| Keccak，宽度 800，五轮和六轮碰撞 | `b800-5r-s00-638b-a`、`b800-6r-s14` |
| Keccak，宽度 1600，五轮碰撞 | `b1600-5r-s00-1438b-a`、`b1600-5r-s00-2878b-a` |
| Keccak，宽度 1600，六轮碰撞 | `b1600-6r-s00`、`b1600-6r-s18` |
| Keccak，宽度 200，竞赛两轮原像和扩展轮窗口三轮原像 | `b200-2r-start3-shortened`、`b200-3r-start93` |
| Keccak，宽度 1600，扩展轮窗口五轮原像 | `b1600-5r-start73-preimage` |
| AES-128-MMO，六轮和七轮半自由起始碰撞及四轮固定 IV 碰撞 | `2A-1`、`2A-2`、`2B-1` |
| AES-128-DM，六轮半自由起始碰撞 | `1A-5` |

原始独立 Python 核验程序和清单保存在[首次归档提交](https://github.com/DayanCryptoLab/WishfulCryptanalysis/tree/6dcc94a4f2db57dcd38a072ea6c265fae754638d/cryptAnalysisAgent/)中。

</details>

C++ 核验程序使用 KeccakTools 提交 `3473478`，保留其 CC0 声明，并对海绵状态缓冲区做了 C++17 兼容性修改。[KeccakTools 源码](https://github.com/KeccakTeam/KeccakTools/tree/3473478bf9c10bf95879cd8960c7409fee313162/Sources)

## 引用

引用论文时，请使用 [IACR ePrint 2026/2965](https://eprint.iacr.org/2026/2965) 的 BibTeX 条目。

```bibtex
@misc{cryptoeprint:2026/2965,
      author = {Guoxiao Liu and Keting Jia and Hongbo Yu and Zongyue Wang and Tianshuo Cong and Junfeng Fan and Anyu Wang and Xiaoyun Wang},
      title = {Do Alice and Bob Dream of the Oracle? Wishful Cryptanalysis},
      howpublished = {Cryptology {ePrint} Archive, Paper 2026/2965},
      year = {2026},
      url = {https://eprint.iacr.org/2026/2965}
}
```

[qbd-experiments]: https://github.com/biwenquan/Guess-and-determine-Rebound
[qbd-zero]: https://iacr.org/submit/files/slides/2025/crypto/crypto2025/137/137_slides.pdf#page=28
[taiyama]: https://eprint.iacr.org/2024/1508
[taiyama-vector]: https://cic.iacr.org/p/3/3/42/pdf#page=39
[dglp]: https://eprint.iacr.org/2022/731
[alda]: https://eprint.iacr.org/2014/216
[grassi]: https://eprint.iacr.org/2019/772.pdf#page=15
[keccak]: https://keccak.team/crunchy_contest.html
[k-c200]: https://keccak.team/crunchy_mails/coll-r2-w200-20230104.txt
[k-c400]: https://keccak.team/crunchy_mails/coll-r5-w400-20261031.txt
[k-c800]: https://keccak.team/crunchy_mails/coll-r5-w800-20160711.txt
[k-here800]: https://keccak.team/crunchy_mails/coll-r6-w800-20261113.txt
[k-c1600]: https://keccak.team/crunchy_mails/coll-r6-w1600-20170226.txt
[k-p200]: https://keccak.team/crunchy_mails/pre-r2-w200-20230822.txt
[k-p400]: https://keccak.team/crunchy_mails/pre-r4-w400-20241116.txt
[k-p800]: https://keccak.team/2025/crunchy_october2025.html
[k-p1600]: https://keccak.team/crunchy_mails/pre-r4-w1600-20161211.txt
