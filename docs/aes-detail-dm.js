// Times are reported experimental measurements. A null time means no
// per-case measurement is reported. Only publicId entries have public checks.
const dmCases = {
  "1A-128": [
    { id: "1A-1", rounds: 4, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "0.016 ms", publicId: true },
    { id: "1A-2", rounds: 4, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "1.77 ms", publicId: true },
    { id: "1A-3", rounds: 5, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "0.625 s", publicId: true },
    { id: "1A-4", rounds: 5, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "28.23 s", publicId: true },
    { id: "1A-5", rounds: 6, en: "Shared IV · M5 Pro", zh: "共享 IV · M5 Pro", time: "308 s", publicId: true },
  ],
  "1A-192": [
    { id: "1A-6", rounds: 7, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "31 ms" },
    { id: "1A-7", rounds: 7, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "20.0 ms" },
    { id: "1A-8", rounds: 7, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: null },
  ],
  "1A-256": [
    { id: "1A-9", rounds: 7, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "18 ms" },
    { id: "1A-10", rounds: 7, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: "12.11 s" },
    { id: "1A-11", rounds: 7, en: "Shared, freely chosen IV", zh: "自由选取的共享 IV", time: null },
    { id: "1A-12", rounds: 8, en: "Shared IV · Windows, 32 threads", zh: "共享 IV · Windows，32 线程", time: "3.17 s" },
    { id: "1A-13", rounds: 9, en: "Shared IV · Windows, 32 threads", zh: "共享 IV · Windows，32 线程", time: "0.77 s" },
    {
      id: "1A-14", rounds: 10, time: "0.0862 s",
      en: "Shared IV · Windows, i9-13900KF, 32 threads",
      zh: "共享 IV · Windows，i9-13900KF，32 线程",
    },
  ],
  "1B-128": [
    { id: "1B-1", rounds: 2, en: "ZERO-IV · published baseline", zh: "ZERO-IV · 已发表基线", time: null, publicId: true },
    { id: "1B-2", rounds: 3, en: "ZERO-IV. Single block on M5 Pro.", zh: "ZERO-IV。M5 Pro 上的单分组实验。", time: "0.64 ms", publicId: true },
    { id: "1B-3", rounds: 3, en: "AES-CRUNCHY-v1. Single block on M5 Pro.", zh: "AES-CRUNCHY-v1。M5 Pro 上的单分组实验。", time: "2.65 ms", publicId: true },
    { id: "1B-3a", rounds: 4, en: "ZERO-IV. Single block on RTX 4070 SUPER.", zh: "ZERO-IV。RTX 4070 SUPER 上的单分组实验。", time: null },
    { id: "1B-3b", rounds: 4, en: "AES-CRUNCHY-v1. Single block on H20.", zh: "AES-CRUNCHY-v1。H20 上的单分组实验。", time: null },
  ],
  "1B-192": [
    { id: "1B-3c", rounds: 5, en: "ZERO-IV · all-zero IV", zh: "ZERO-IV · 全零 IV", time: null },
    { id: "1B-3d", rounds: 5, en: "AES-CRUNCHY-v1 · contest-derived IV", zh: "AES-CRUNCHY-v1 · 赛题派生 IV", time: null },
  ],
  "1B-256": [
    { id: "1B-4", rounds: 5, en: "AES-CRUNCHY-v1. The report gives 0.24 s at five rounds without a per-IV timing.", zh: "AES-CRUNCHY-v1。报告给出五轮耗时 0.24 秒，未按 IV 分列。", time: null },
    { id: "1B-5", rounds: 5, en: "ZERO-IV. The report gives 0.24 s at five rounds without a per-IV timing.", zh: "ZERO-IV。报告给出五轮耗时 0.24 秒，未按 IV 分列。", time: null },
    { id: "1B-6", rounds: 6, en: "AES-CRUNCHY-v1. Single block on H20.", zh: "AES-CRUNCHY-v1。H20 上的单分组实验。", time: "6.20 s" },
    { id: "1B-7", rounds: 6, en: "ZERO-IV. Single block on H20.", zh: "ZERO-IV。H20 上的单分组实验。", time: "144.94 s" },
    { id: "1B-8", rounds: 7, en: "AES-CRUNCHY-v1. Single block on H20.", zh: "AES-CRUNCHY-v1。H20 上的单分组实验。", time: "58.14 s" },
    { id: "1B-9", rounds: 7, en: "ZERO-IV. Single block on H20.", zh: "ZERO-IV。H20 上的单分组实验。", time: "257.66 s" },
  ],
  "1C-128": [
    { id: "1C-1", rounds: 4, en: "ZERO-IV · two blocks · M5 Pro", zh: "ZERO-IV · 双分组 · M5 Pro", time: "589.784 s", publicId: true },
    { id: "1C-2", rounds: 4, en: "AES-CRUNCHY-v1 · two blocks · M5 Pro", zh: "AES-CRUNCHY-v1 · 双分组 · M5 Pro", time: "157.012 s", publicId: true },
  ],
  "1C-256": [
    { id: "1C-3", rounds: 5, en: "AES-CRUNCHY-v1 · two blocks", zh: "AES-CRUNCHY-v1 · 双分组", time: null },
    { id: "1C-4", rounds: 5, en: "ZERO-IV · two blocks", zh: "ZERO-IV · 双分组", time: null },
    { id: "1C-5", rounds: 6, en: "AES-CRUNCHY-v1 · two blocks", zh: "AES-CRUNCHY-v1 · 双分组", time: null },
    { id: "1C-6", rounds: 6, en: "ZERO-IV · two blocks", zh: "ZERO-IV · 双分组", time: null },
    { id: "1C-7", rounds: 7, en: "AES-CRUNCHY-v1 · two blocks", zh: "AES-CRUNCHY-v1 · 双分组", time: null },
    { id: "1C-8", rounds: 7, en: "ZERO-IV · two blocks", zh: "ZERO-IV · 双分组", time: null },
    { id: "1C-9", rounds: 8, en: "AES-CRUNCHY-v1 · Windows, 32 threads", zh: "AES-CRUNCHY-v1 · Windows，32 线程", time: "14.07 s" },
    { id: "1C-10", rounds: 8, en: "ZERO-IV · Windows, 32 threads", zh: "ZERO-IV · Windows，32 线程", time: "5.93 s" },
    { id: "1C-11", rounds: 9, en: "AES-CRUNCHY-v1 · Windows, 32 threads", zh: "AES-CRUNCHY-v1 · Windows，32 线程", time: "182.83 s" },
    { id: "1C-12", rounds: 9, en: "ZERO-IV · Windows, 32 threads", zh: "ZERO-IV · Windows，32 线程", time: "496.64 s" },
    { id: "1C-13", rounds: 10, en: "AES-CRUNCHY-v1 · Windows, 32 threads", zh: "AES-CRUNCHY-v1 · Windows，32 线程", time: "559.88 s" },
    { id: "1C-14", rounds: 10, en: "ZERO-IV · Windows, 32 threads", zh: "ZERO-IV · Windows，32 线程", time: "90.98 s" },
  ],
};
