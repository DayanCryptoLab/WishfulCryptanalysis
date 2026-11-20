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
    highlightPairs: "已核验的碰撞对",
    rounds: "轮",
    vectors: "组见证",
    leaderboardTitle: "实用纪录榜单",
    leaderboardDescription: "此前的纪录来自已完成的实验或已发布的测试向量。本项目已核验的结果附有核验程序中的用例编号。",
    filterLabel: "按赛道类型筛选",
    allRecords: "全部纪录",
    keyRecovery: "密钥恢复",
    searchLabel: "搜索纪录",
    searchPlaceholder: "搜索赛道",
    tableLabel: "AES 实用纪录",
    columnChallenge: "赛道",
    columnVariant: "变体",
    columnPrior: "此前实用纪录",
    columnProject: "本项目已核验",
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
    singleKeyRecovery: "单密钥恢复",
    keyDescription: "在选定明文数量的限制内恢复完整的 AES-128 密钥。",
    rule3ABefore: "最多可选定",
    rule3AAfter: "条明文。",
    rule3B: "最多可选定 16 条明文。",
    fixedIv: "固定 IV。",
    zeroIv: "使用全零初始链接值。",
    crunchyIv: "使用赛道指定的公开 IV。",
    verifyTitle: "核验结果",
    verifyDescription: "在仓库根目录使用 Python 3 运行核验程序。程序核验全部 15 组 AES-128 碰撞见证，以及 FIPS 197 的 AES-128、AES-192 和 AES-256 已知答案测试向量。",
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
  "3A": ["实用数据量", "最多可选定 2³⁴ 条明文"],
  "3B": ["极低数据量", "最多可选定 16 条明文"],
};

const aesRecordTranslations = {
  "1A-128": {
    prior: "已发表的全零 IV 碰撞对，同时满足共用 IV 的条件。",
    project: "所记录的实验用时 0.625 秒。",
  },
  "1A-192": { prior: "单个 CPU 核心上用时数分钟。" },
  "1A-256": { prior: "已发表的碰撞对，求解用时 12 小时。" },
  "1B-128": {
    prior: "已发表的全零 IV 碰撞对。",
    project: "ZERO-IV 用时 0.64 毫秒，AES-CRUNCHY-v1 用时 2.65 毫秒。",
  },
  "1B-192": { prior: "目标固定，单个 CPU 核心上用时数分钟。" },
  "1B-256": { prior: "目标固定，单个 CPU 核心上用时数分钟。" },
  "1C-128": { project: "ZERO-IV 用时 589.784 秒，AES-CRUNCHY-v1 用时 157.012 秒。" },
  "2A-128": {
    prior: "已完成实验所得并已发表的碰撞对。",
    project: "七轮实算用时 9.172 秒，六轮实算用时 1.55 秒。",
  },
  "2B-128": {
    project: "AES-CRUNCHY-v1 分布式实验中，找到六轮碰撞的任务用时 99.62 秒。五轮实算中，AES-CRUNCHY-v1 和 ZERO-IV 分别用时 0.052 秒和 23.518 秒。",
  },
  "3A-128": { prior: "使用 3 × 2³² 次查询恢复完整密钥，在六台四核计算机上平均用时 11.5 天。" },
  "3B-128": { prior: "使用 4 条选定明文恢复最后一轮的完整轮密钥，文献报告在笔记本电脑上几乎即时完成。" },
};

function localizeAesRecords(records) {
  return records.map((record) => {
    const [label, detail] = aesChallengeTranslations[record.challenge] ?? [record.label, record.detail];
    const translation = aesRecordTranslations[record.id] ?? {};
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
