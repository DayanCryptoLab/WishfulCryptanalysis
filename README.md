# WishfulCryptanalysis

Practical records for reduced-round AES and Keccak challenges.

[AES leaderboard](#aes-challenges) · [Keccak leaderboard](#keccak-challenges) · [Verify the results](#verify-the-results)

> **Highlights**
>
> AES-128-MMO reaches **7 rounds** for semi-free-start collisions and **6 rounds** for a fixed-IV collision. Keccak with an 800-bit state reaches **6 rounds** on the official collision leaderboard. The 200-bit Keccak contest preimage is **477 bits** long, down from the published 517-bit solution.

## AES challenges

The AES variants retain the standard key schedule and 128-bit block size. The last retained round omits MixColumns. For **semi-free-start** (SFS), both inputs share a freely chosen IV. For **fixed IV**, the challenge specifies the IV ahead of time. The bundled tests use the all-zero IV (`ZERO-IV`) and a challenge-specific public IV (`AES-CRUNCHY-v1`).

The previous-record columns show the highest-round comparable results supported by completed experiments or concrete examples in the cited sources. A dash marks a gap in the evidence covered here. Runtimes are from the original runs on their respective hardware. **Verified here** refers to the bundled fixed inputs.

### Davies–Meyer collisions

The message block serves as the AES key. The two-block challenge requires distinct first-block chaining values before they converge.

| Challenge | Instance | Previous practical result | Verified here |
| :--- | :--- | :--- | :--- |
| **1A · SFS** | AES-128-DM | **3 rounds**, a zero-IV pair also meets the SFS condition. [Qin, Bi & Dong, CRYPTO 2025][qbd-zero] | **5 rounds**, 0.625 s (`1A-3`) |
| **1A · SFS** | AES-192-DM | **7 rounds**, minutes on one CPU core. [Qin, Bi & Dong, CRYPTO 2025][qbd-experiments] | — |
| **1A · SFS** | AES-256-DM | **9 rounds**, published pair found in 12 h. [Taiyama et al., ASIACRYPT 2024][taiyama] | — |
| **1B · One block, fixed IV** | AES-128-DM | **3 rounds**, zero IV, published pairs. [Qin, Bi & Dong, CRYPTO 2025][qbd-zero] | **3 rounds**, 0.64 ms (`ZERO-IV`, `1B-2`) and 2.65 ms (`AES-CRUNCHY-v1`, `1B-3`) |
| **1B · One block, fixed IV** | AES-192-DM | **5 rounds**, fixed target, minutes on one CPU core. [Qin, Bi & Dong, CRYPTO 2025][qbd-experiments] | — |
| **1B · One block, fixed IV** | AES-256-DM | **6 rounds**, fixed target, minutes on one CPU core. [Qin, Bi & Dong, CRYPTO 2025][qbd-experiments] | — |
| **1C · Two blocks, fixed IV** | AES-128-DM | — | **4 rounds**, 589.784 s (`ZERO-IV`, `1C-1`) and 157.012 s (`AES-CRUNCHY-v1`, `1C-2`) |

The bundled two-round `ZERO-IV` baseline (`1B-1`) is the example in Taiyama et al.'s 2026 Table 12. [IACR Communications in Cryptology][taiyama-vector]

### Matyas–Meyer–Oseas collisions

The chaining value serves as the AES key. The fixed-IV challenge accepts equal-length inputs of one or two blocks.

| Challenge | Instance | Previous practical result | Verified here |
| :--- | :--- | :--- | :--- |
| **2A · SFS** | AES-128-MMO | **6 rounds**, concrete collision pair. [Dong, Guo, Li & Pham, CRYPTO 2022][dglp] | **7 rounds**, 9.172 s (`2A-2`). The 6-round run took 1.55 s (`2A-1`) |
| **2B · Fixed IV** | AES-128-MMO | — | **6 rounds** with `AES-CRUNCHY-v1` (`2B-4`, winning task took 99.62 s in a distributed run). **5 rounds** in 0.052 s with `AES-CRUNCHY-v1` (`2B-2`) and 23.518 s with `ZERO-IV` (`2B-3`) |

### Single-key recovery

Both AES-128 tracks require recovery of the full key from chosen plaintexts within the query budget. A complete round key determines the AES-128 master key. The entries below are literature baselines.

| Challenge | Query budget | Previous practical result |
| :--- | :--- | :--- |
| **3A · Practical data** | Up to 2³⁴ chosen plaintexts | **6 rounds**, full-key recovery with 3 × 2³² queries, averaging 11.5 days on six quad-core PCs. [Aldà, Aragona, Nicolodi & Sala, Table 2][alda] |
| **3B · Ultra-low data** | Up to 16 chosen plaintexts | **3 rounds**, full final-round key recovered with 2–3 chosen plaintexts in the reported experiments. [Grassi, Rechberger & Rønjom, §1.7][grassi] |

## Keccak challenges

State width is `b`, capacity is 160 bits, rate is `r = b − 160`, and `start` is the zero-based index of the first round. The official contest uses a 160-bit collision digest and an 80-bit preimage target. [Keccak Team rules and results][keccak]

### Collision leaderboard

| Width / rate (bits) | Previous official practical result | Verified here |
| :--- | :--- | :--- |
| **200 / 40** | **2 rounds**, Andreas Westfeld (2023). [Submission][k-c200] | **2 rounds**, starts 3 and 9. The start-9 pair matches all 200 state bits |
| **400 / 240** | **5 rounds**, Stefan Kölbl (2026). [Submission][k-c400] | — |
| **800 / 640** | **5 rounds**, Qiao, Song, Liu & Guo (2016). [Submission][k-c800] | **6 rounds**, start 14, two 638-bit messages. About 16 h on 1,000 CPU cores. [Official submission, November 2026][k-here800] |
| **1600 / 1440** | **6 rounds**, Song, Liao & Guo (2017), start 0. [Submission][k-c1600] | **6 rounds**, starts 0 and 18, two 1,438-bit messages in each pair. The runs took 104.626 s and 146.579 s, respectively |

<details>
<summary>Collision fixtures and verification scope</summary>

The [23 recorded pairs](hash-challenge/collision_witnesses.json) cover width 200 at 2 rounds, width 800 at 3–6 rounds, and width 1600 at 5–6 rounds. Each fixture gives the start round, both message lengths, the expected digest, and its source record. The 2-round width-200 start-9 pair and the 5-round width-1600 start-0 pair of 2,878-bit messages also pass a full-state equality check.

At width 800, the 5-round start-0, 1,278-bit pair took 9.443 ms. At width 1600 and 5 rounds, the start-0 pairs of 1,438 and 2,878 bits took 0.899 ms and 0.187 ms, respectively.

</details>

### Preimage leaderboard

| Width / rate (bits) | Best official practical result | Verified here in the contest window |
| :--- | :--- | :--- |
| **200 / 40** | **2 rounds**, start 3, 517 bits. Lin, Yu, Lu & Shen (2023). [Submission][k-p200] | **2 rounds**, start 3, **477 bits** for the same target `024a5518e1e95db53219` |
| **400 / 240** | **4 rounds**, Lin, Yu, Ren, Lu & Shen (2024). [Submission][k-p400] | — |
| **800 / 640** | **5 rounds**, Lin, Yu, Dong, Wu & Shen (2025), 27 blocks. [Announcement][k-p800] | — |
| **1600 / 1440** | **4 rounds**, Liu & Guo (2016), 2,878 bits. [Submission][k-p1600] | — |

<details>
<summary>Extended-window and partial-match experiments</summary>

| Configuration | Checked result |
| :--- | :--- |
| **200-bit width · 3 rounds · start 93** | Complete 398-bit zero-IV message for `d8ed85692afbee4c99ce`. Its round window is 93–95, extending beyond the contest start range of 0–15 |
| **1600-bit width · 5 rounds · start 0** | Five 1,438-bit messages with partial matches to `653bc0f87d264f0857d0`. The best total is 65 of 80 bits and the best prefix is 34 bits, in separate samples |
| **1600-bit width · 5 rounds · start 73** | Four archived internal states with nonzero capacity reproduce `653bc0f87d264f0857d0` under the raw permutation. The original benchmark reported 45 such states |

The [preimage fixture file](hash-challenge-Preimage/results.json) contains complete messages, partial matches in Keccak's least-significant-bit-first order, and raw states. The runners check these three kinds of records against their corresponding conditions.

</details>

## Verify the results

From the repository root, run the commands below with Python 3 and a C++17 compiler. The checks run offline on the bundled inputs.

```sh
verify_dir=$(mktemp -d) &&
c++ -std=c++17 -O2 -Ihash-challenge/vendor \
  hash-challenge/verify_crunchy.cpp hash-challenge/vendor/*.cpp \
  -o "$verify_dir/verify_crunchy" &&
python3 -E -B hash-challenge/verify_results.py "$verify_dir/verify_crunchy" &&
python3 -E -B hash-challenge-Preimage/verify_results.py "$verify_dir/verify_crunchy" &&
python3 -E -B aes-challenge/verify_all_results.py
```

| Suite | Expected checks | Inputs |
| :--- | :--- | :--- |
| Keccak collision | **23 pairs**, including 2 full-state collisions | [Collision fixtures](hash-challenge/collision_witnesses.json) |
| Keccak preimage | **11 checks**, including 2 complete messages, 5 partial matches, and 4 raw states | [Preimage fixtures](hash-challenge-Preimage/results.json) |
| AES collision | **15 pairs** and 3 FIPS 197 known-answer vectors | [AES fixtures and tests](aes-challenge/verify_all_results.py) |

<details>
<summary>cryptAnalysisAgent paper fixture index</summary>

The fixed inputs from the paper appear inside the challenge suites. Look for these IDs in the verification output.

| Paper result | Fixture IDs |
| :--- | :--- |
| Keccak, width 200, 2-round full-state collision | `b200-2r-s09` |
| Keccak, width 800, 5- and 6-round collisions | `b800-5r-s00-638b-a`, `b800-6r-s14` |
| Keccak, width 1600, 5-round collisions | `b1600-5r-s00-1438b-a`, `b1600-5r-s00-2878b-a` |
| Keccak, width 1600, 6-round collisions | `b1600-6r-s00`, `b1600-6r-s18` |
| Keccak, width 200, 2-round contest and 3-round extended-window preimages | `b200-2r-start3-shortened`, `b200-3r-start93` |
| AES-128-MMO, 6- and 7-round SFS and 4-round fixed-IV collisions | `2A-1`, `2A-2`, `2B-1` |

The original independent Python checks and manifests are in the [first archive commit](https://github.com/OSR-Lab/WishfulCryptanalysis/tree/6dcc94a4f2db57dcd38a072ea6c265fae754638d/cryptAnalysisAgent/).

</details>

The C++ verifier uses KeccakTools at commit `3473478` with its CC0 notices and a C++17 compatibility change for the sponge-state buffer. [KeccakTools source](https://github.com/KeccakTeam/KeccakTools/tree/3473478bf9c10bf95879cd8960c7409fee313162/Sources)

[qbd-experiments]: https://github.com/biwenquan/Guess-and-determine-Rebound
[qbd-zero]: https://iacr.org/submit/files/slides/2025/crypto/crypto2025/137/137_slides.pdf#page=28
[taiyama]: https://eprint.iacr.org/2024/1508
[taiyama-vector]: https://cic.iacr.org/p/3/3/42/pdf#page=39
[dglp]: https://eprint.iacr.org/2022/731
[alda]: https://eprint.iacr.org/2014/216
[grassi]: https://eprint.iacr.org/2016/592.pdf
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
