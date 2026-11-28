const mpCases = {
  "4A-sfs-128": [
    {
      id: "4A-1", rounds: 6,
      en: "Shared starting chaining value. Literature baseline from CRYPTO 2022, with the same inputs as 2A-1.",
      zh: "相同初始链接值。CRYPTO 2022 文献基线，输入与 2A-1 相同。",
      time: null,
    },
    {
      id: "4A-2", rounds: 7,
      en: "Shared starting chaining value. The winning batch on an M5 Pro also produced MMO case 2A-2.",
      zh: "相同初始链接值。M5 Pro 上的命中批次与 MMO 用例 2A-2 共用。",
      time: "9.172 s", timeZh: "9.172 秒",
    },
  ],
  "4A-sfs-192": [
    {
      id: "4A-3", rounds: 7,
      en: "Shared starting chaining value. Windows with an i9-13900KF and 32 threads.",
      zh: "相同初始链接值。Windows，i9-13900KF，32 线程。",
      time: "52.595 s", timeZh: "52.595 秒",
    },
  ],
  "4A-sfs-256": [
    {
      id: "4A-4", rounds: 7,
      en: "Shared starting chaining value. Windows with an i9-13900KF and 32 threads.",
      zh: "相同初始链接值。Windows，i9-13900KF，32 线程。",
      time: "10.439 s", timeZh: "10.439 秒",
    },
  ],
  "4A-fs-128": [
    { id: "4A-5", rounds: 6, en: "Distinct starting chaining values.", zh: "初始链接值不同。", time: "0.644 s", timeZh: "0.644 秒" },
    { id: "4A-6", rounds: 7, en: "Distinct starting chaining values.", zh: "初始链接值不同。", time: "45.0 s", timeZh: "45.0 秒" },
  ],
  "4A-fs-192": [
    {
      id: "4A-7", rounds: 7,
      en: "Distinct starting chaining values. Windows with an i9-13900KF and 32 threads.",
      zh: "初始链接值不同。Windows，i9-13900KF，32 线程。",
      time: "0.095 s", timeZh: "0.095 秒",
    },
  ],
  "4A-fs-256": [
    {
      id: "4A-8", rounds: 7,
      en: "Distinct starting chaining values. Windows with an i9-13900KF and 32 threads.",
      zh: "初始链接值不同。Windows，i9-13900KF，32 线程。",
      time: "< 1 ms", timeZh: "< 1 毫秒",
    },
    {
      id: "4A-9", rounds: 9,
      en: "Distinct starting chaining values. Windows with an i9-13900KF and 32 threads.",
      zh: "初始链接值不同。Windows，i9-13900KF，32 线程。",
      time: "0.576 s", timeZh: "0.576 秒",
    },
  ],
  "4B-128": [
    {
      id: "4B-1", rounds: 3,
      en: "AES-CRUNCHY-v1. Two blocks with distinct first-block chaining values.",
      zh: "AES-CRUNCHY-v1。双分组，首分组链接值不同。",
      time: "0.115 s", timeZh: "0.115 秒",
    },
    {
      id: "4B-2", rounds: 3,
      en: "ZERO-IV. Two blocks with distinct first-block chaining values.",
      zh: "ZERO-IV。双分组，首分组链接值不同。",
      time: "0.155 s", timeZh: "0.155 秒",
    },
    { id: "4B-3", rounds: 4, en: "AES-CRUNCHY-v1. Single block.", zh: "AES-CRUNCHY-v1。单分组。", time: null },
    { id: "4B-4", rounds: 4, en: "ZERO-IV. Single block.", zh: "ZERO-IV。单分组。", time: null },
    { id: "4B-5", rounds: 5, en: "AES-CRUNCHY-v1. Single block.", zh: "AES-CRUNCHY-v1。单分组。", time: null },
    { id: "4B-6", rounds: 5, en: "ZERO-IV. Single block.", zh: "ZERO-IV。单分组。", time: null },
    {
      id: "4B-7", rounds: 6,
      en: "AES-CRUNCHY-v1. Single block. Reported time to hit on the winning RTX 4070 SUPER shard.",
      zh: "AES-CRUNCHY-v1。单分组。所列为 RTX 4070 SUPER 分片的命中耗时。",
      time: "4,975.75 s", timeZh: "4,975.75 秒",
    },
    {
      id: "4B-8", rounds: 6,
      en: "ZERO-IV. Single block. Reported time to the CPU worker's hit in the distributed run shared with 2B-5.",
      zh: "ZERO-IV。单分组。所列为分布式运行中 CPU 工作进程的命中耗时，与 2B-5 共用该次运行。",
      time: "6,721.96 s", timeZh: "6,721.96 秒",
    },
  ],
  "4C-128": [
    { id: "4C-1", rounds: 5, en: "AES-CRUNCHY-v1. Academic two-block setting with a shared first block.", zh: "AES-CRUNCHY-v1。学术双分组口径，首分组相同。", time: null },
    { id: "4C-2", rounds: 5, en: "ZERO-IV. Academic two-block setting with a shared first block.", zh: "ZERO-IV。学术双分组口径，首分组相同。", time: null },
    {
      id: "4C-7", rounds: 6,
      en: "AES-CRUNCHY-v1. Academic two-block setting. Reported time to the first-block hit on an RTX 4080.",
      zh: "AES-CRUNCHY-v1。学术双分组口径，所列为 RTX 4080 上的首分组命中耗时。",
      time: "8,004.01 s", timeZh: "8,004.01 秒",
    },
    {
      id: "4C-8", rounds: 6,
      en: "ZERO-IV. Academic two-block setting. Derived from 4B-8. The time is for the shared first-block hit.",
      zh: "ZERO-IV。学术双分组口径，由 4B-8 延伸，所列为共用的首分组命中耗时。",
      time: "6,721.96 s", timeZh: "6,721.96 秒",
    },
  ],
  "4C-192": [
    { id: "4C-3", rounds: 5, en: "AES-CRUNCHY-v1. Academic two-block setting with a shared first block.", zh: "AES-CRUNCHY-v1。学术双分组口径，首分组相同。", time: null },
    { id: "4C-4", rounds: 5, en: "ZERO-IV. Academic two-block setting with a shared first block.", zh: "ZERO-IV。学术双分组口径，首分组相同。", time: null },
    {
      id: "4C-9", rounds: 6,
      en: "ZERO-IV. Academic two-block setting. Reported time to the first-block hit by a CPU worker.",
      zh: "ZERO-IV。学术双分组口径，所列为 CPU 工作进程的首分组命中耗时。",
      time: "3,578.36 s", timeZh: "3,578.36 秒",
    },
    {
      id: "4C-10", rounds: 6,
      en: "AES-CRUNCHY-v1. Academic two-block setting. Reported time to the first-block hit on an RTX 4070 SUPER.",
      zh: "AES-CRUNCHY-v1。学术双分组口径，所列为 RTX 4070 SUPER 上的首分组命中耗时。",
      time: "15,553.48 s", timeZh: "15,553.48 秒",
    },
  ],
  "4C-256": [
    { id: "4C-5", rounds: 5, en: "AES-CRUNCHY-v1. Academic two-block setting with a shared first block.", zh: "AES-CRUNCHY-v1。学术双分组口径，首分组相同。", time: null },
    { id: "4C-6", rounds: 5, en: "ZERO-IV. Academic two-block setting with a shared first block.", zh: "ZERO-IV。学术双分组口径，首分组相同。", time: null },
    {
      id: "4C-11", rounds: 6,
      en: "ZERO-IV. Academic two-block setting. Reported time to the first-block hit on an RTX 4080.",
      zh: "ZERO-IV。学术双分组口径，所列为 RTX 4080 上的首分组命中耗时。",
      time: "15,028.23 s", timeZh: "15,028.23 秒",
    },
    {
      id: "4C-12", rounds: 6,
      en: "AES-CRUNCHY-v1. Academic two-block setting. Reported time to the first-block hit on an RTX 4070 SUPER.",
      zh: "AES-CRUNCHY-v1。学术双分组口径，所列为 RTX 4070 SUPER 上的首分组命中耗时。",
      time: "9,031.43 s", timeZh: "9,031.43 秒",
    },
  ],
};
