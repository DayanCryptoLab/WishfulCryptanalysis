if (isChinese) {
  document.title = "AES Crunchy 密码竞赛 · 许愿式密码分析";
  translatePage({
    description: "减轮 AES 碰撞与密钥恢复赛道的实用纪录和核验方法。",
    skipLink: "跳至正文",
    homeLabel: "许愿式密码分析首页",
    wordmark: "许愿式密码分析",
    navigation: "站内导航",
    navLeaderboard: "榜单",
    navRules: "规则",
    navVerify: "核验",
    eyebrow: "减轮 AES",
    heroTitle: "密码竞赛",
    heroDescription: "查看碰撞与密钥恢复的实用纪录、各项结果的适用条件，以及用于核验本项目结果的测试向量。",
    explore: "查看榜单",
    verifyLocally: "本地核验",
    state: "AES 状态",
    stateSize: "4 × 4 字节",
    highlights: "本项目已核验的代表性结果",
    highlightSfs: "AES-128-MMO 半自由起始",
    highlightFixed: "AES-128-MMO 固定 IV",
    highlightPairs: "公开归档的 AES-128 碰撞对",
    rounds: "轮",
    vectors: "组见证",
    leaderboardTitle: "实用纪录榜单",
    leaderboardDescription: "每行汇总一个赛道及对应的 AES 变体。展开详情可查看各用例的轮数、实验条件、报告耗时和验证编号。可点击的编号收录在公开核验程序中。本地编号对应的验证材料保存在本地。",
    filterLabel: "按赛道类型筛选",
    allRecords: "全部纪录",
    keyRecovery: "密钥恢复",
    searchLabel: "搜索纪录",
    searchPlaceholder: "搜索赛道或验证编号",
    tableLabel: "AES 实用纪录",
    columnChallenge: "赛道",
    columnVariant: "变体",
    columnPrior: "此前实用纪录",
    columnProject: "本项目实测",
    empty: "没有符合当前筛选条件的纪录。",
    clearFilters: "清除筛选",
    timeNote: "所列用时来自不同硬件上的原始实验。",
    rulesTitle: "赛道规则",
    rulesDescription: "各赛道均使用 128 位 AES 分组和标准密钥编排，所保留的最后一轮省略 MixColumns。",
    dmDescription: "消息分组用作 AES 密钥，压缩函数输出异或上一分组的链接值。",
    rule1A: "自由选定一个 IV，两条输入共用。",
    rule1B: "在指定 IV 下求单分组碰撞。",
    rule1C: "求双分组碰撞，要求两条输入的首分组链接值互异。",
    mmoDescription: "链接值用作 AES 密钥，压缩函数输出异或消息分组。",
    rule2B: "使用指定 IV，两条等长输入各含一或两个分组。双分组情形要求首分组链接值互异。",
    rule2C: "在指定 IV 下的学术多分组口径，允许首分组链接值相同。",
    rule4A: "半自由起始共用初始链接值，自由起始使用不同的初始链接值。",
    rule4B: "使用指定 IV，允许单分组或双分组输入。双分组情形要求首分组链接值互异。",
    rule4C: "在指定 IV 下的学术多分组口径，允许首分组链接值相同。",
    singleKeyRecovery: "单密钥恢复",
    keyDescription: "在选定明文数量的限制内恢复完整的 AES-128 密钥。",
    rule3ABefore: "最多可选定",
    rule3AAfter: "条明文。",
    rule3B: "最多可选定 16 条明文。",
    fixedIv: "固定 IV。",
    zeroIv: "使用全零初始链接值。",
    crunchyIv: "使用赛道指定的公开 IV。",
    verifyTitle: "核验结果",
    verifyDescription: "在仓库根目录使用 Python 3 运行公开版核验程序，可核验此前归档的 16 组 AES-128 碰撞见证，以及 FIPS 197 的 AES-128、AES-192 和 AES-256 已知答案测试向量。",
    verifyCode: "查看核验代码",
    repoRoot: "在仓库根目录运行",
    copyCommand: "复制命令",
    repoLink: "许愿式密码分析代码仓库",
    keccakLink: "Keccak Crunchy 竞赛",
  });
}

const aesChallengeTranslations = {
  "1A": ["半自由起始", "两条输入共用一个自由选定的 IV"],
  "1B": ["单分组固定 IV", "在指定 IV 下使用一个消息分组"],
  "1C": ["双分组固定 IV", "首分组链接值互异"],
  "2A": ["半自由起始", "两条输入共用一个自由选定的 IV"],
  "2B": ["固定 IV", "两条等长输入各含一或两个分组"],
  "2C": ["多分组固定 IV", "学术口径，允许首分组链接值相同"],
  "3A": ["实用数据量", "最多可选定 2³⁴ 条明文"],
  "3B": ["极低数据量", "最多可选定 16 条明文"],
  "4A": ["半自由起始", "两条输入共用一个自由选定的初始链接值"],
  "4B": ["固定 IV", "单分组或双分组，双分组的首分组链接值互异"],
  "4C": ["多分组固定 IV", "学术双分组口径，允许首分组链接值相同"],
};

const aesRecordTranslations = {
  "1A-128": {
    prior: "已发表的全零 IV 碰撞对，同时满足共用 IV 的条件。",
    project: "六轮碰撞在笔记本上耗时 308 秒。五轮实验耗时 0.625 秒。",
  },
  "1A-192": {
    prior: "单个 CPU 核心上用时数分钟。",
    project: "两次七轮实算分别用时 31 毫秒（1A-6）和 20.0 毫秒（1A-7）。1A-8 未报告耗时。",
  },
  "1A-256": {
    prior: "已发表的碰撞对，求解用时 12 小时。",
    project: "报告中的十轮命中用时为 0.0862 秒，使用 Windows、i9-13900KF 和 32 线程。八轮和九轮分别用时 3.17 秒和 0.77 秒。",
  },
  "1B-128": {
    prior: "已发表的全零 IV 碰撞对。",
    project: "ZERO-IV（1B-3a）和 AES-CRUNCHY-v1（1B-3b）都有四轮单分组碰撞，四轮耗时未报告。三轮实算中，两种 IV 分别用时 0.64 毫秒和 2.65 毫秒。",
  },
  "1B-192": {
    prior: "目标固定，单个 CPU 核心上用时数分钟。",
    project: "ZERO-IV（1B-3c）和 AES-CRUNCHY-v1（1B-3d）均有五轮单分组碰撞，耗时未报告。",
  },
  "1B-256": {
    prior: "目标固定，单个 CPU 核心上用时数分钟。",
    project: "在 NVIDIA H20 上，七轮单分组碰撞的命中用时分别为 AES-CRUNCHY-v1 58.14 秒（1B-8）和 ZERO-IV 257.66 秒（1B-9）。六轮分别用时 6.20 秒和 144.94 秒。",
  },
  "1C-128": { project: "ZERO-IV 用时 589.784 秒，AES-CRUNCHY-v1 用时 157.012 秒。" },
  "1C-256": { project: "Windows 32 线程实算中，AES-CRUNCHY-v1 用时 559.88 秒（1C-13），ZERO-IV 用时 90.98 秒（1C-14）。" },
  "2A-128": {
    prior: "已完成实验所得并已发表的碰撞对。",
    project: "七轮碰撞在笔记本上的命中批次用时 9.172 秒，六轮实算用时 1.55 秒。",
  },
  "2B-128": {
    project: "六轮 AES-CRUNCHY-v1 实验的命中任务用时 99.62 秒（2B-4）。六轮 ZERO-IV 分布式实验由 CPU 工作进程在 6,721.96 秒后命中（2B-5）。五轮实算中，两种 IV 分别用时 0.052 秒和 23.518 秒。",
  },
  "2C-128": { project: "AES-CRUNCHY-v1 和 ZERO-IV 的六轮双分组见证由单分组用例 2B-4 和 2B-5 延伸得到，未报告单独的双分组耗时。报告还收录了原生五轮多分组见证，未单列耗时。" },
  "3A-128": {
    prior: "使用 3 × 2³² 次查询恢复完整密钥，在六台四核计算机上平均用时 11.5 天。",
    project: "六轮完整密钥恢复使用 2³³ 条选定明文，低于 2³⁴ 的上限。在 i9-13900KF 和 RTX 4080 上报告耗时 300.44–301.17 秒。验证器使用归档样本复核记录。五轮使用 3,211,264 次查询，M5 Pro 用时 0.73–0.76 秒，i9-13900KF 用时 1.49–1.57 秒。",
  },
  "3B-128": {
    prior: "使用 4 条选定明文恢复最后一轮的完整轮密钥，文献报告在笔记本电脑上几乎即时完成。",
    project: "四轮完整密钥恢复在 16 次查询预算内完成，明文均为非自适应选定。使用 5 条时，M5 Pro 用时 7.12 秒，i9-13900KF 用时 9.32 秒。使用 6 条时，分别用时 6.50 秒和 8.07–8.18 秒。验证器使用样本复核归档记录。",
  },
  "4A-sfs-128": { project: "M5 Pro 上的命中批次用时 9.172 秒，与 MMO 用例 2A-2 来自同一次实验。" },
  "4A-sfs-192": { project: "Windows 上用时 52.595 秒，使用 i9-13900KF 和 32 线程。" },
  "4A-sfs-256": { project: "Windows 上用时 10.439 秒，使用 i9-13900KF 和 32 线程。" },
  "4A-fs-128": {
    challenge: ["自由起始", "两条输入使用不同的初始链接值"],
    project: "七轮用时 45.0 秒，六轮用时 0.644 秒。",
  },
  "4A-fs-192": {
    challenge: ["自由起始", "两条输入使用不同的初始链接值"],
    project: "Windows 上用时 0.095 秒，使用 i9-13900KF 和 32 线程。",
  },
  "4A-fs-256": {
    challenge: ["自由起始", "两条输入使用不同的初始链接值"],
    project: "Windows 上九轮用时 0.576 秒，七轮用时低于 1 毫秒，使用 i9-13900KF 和 32 线程。",
  },
  "4B-128": { project: "AES-CRUNCHY-v1 的 RTX 4070 SUPER 命中用时 4,975.75 秒（4B-7）。ZERO-IV 的分布式实验由 CPU 工作进程在 6,721.96 秒后命中（4B-8，与 2B-5 同一次实验）。" },
  "4C-128": { project: "双分组见证由单分组碰撞延伸。AES-CRUNCHY-v1 的 RTX 4080 命中用时 8,004.01 秒。ZERO-IV 沿用 4B-8 的命中记录（6,721.96 秒）。双分组耗时未单独测量。" },
  "4C-192": { project: "首分组命中用时：ZERO-IV 为 3,578.36 秒（4C-9，CPU 工作进程），AES-CRUNCHY-v1 为 15,553.48 秒（4C-10，RTX 4070 SUPER）。" },
  "4C-256": { project: "首分组命中用时：ZERO-IV 为 15,028.23 秒（4C-11，RTX 4080），AES-CRUNCHY-v1 为 9,031.43 秒（4C-12，RTX 4070 SUPER）。" },
};

function localizeAesRecords(records) {
  return records.map((record) => {
    const translation = aesRecordTranslations[record.id] ?? {};
    const [label, detail] = translation.challenge ?? aesChallengeTranslations[record.challenge] ?? [record.label, record.detail];
    return {
      ...record,
      label,
      detail,
      englishLabel: record.label,
      prior: record.prior && { ...record.prior, detail: translation.prior ?? record.prior.detail },
      project: record.project && { ...record.project, detail: translation.project ?? record.project.detail },
    };
  });
}
