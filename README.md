# WishfulCryptanalysis

Practical results and offline verification for reduced-round Keccak and AES challenges. The `cryptAnalysisAgent` paper cases are indexed by the fixture IDs used in the three challenge suites.

## Verify all results

Run from the repository root with a C++17 compiler and Python 3 with its standard library. The commands build the shared Keccak verifier and check the archived vectors offline.

```sh
verify_dir=$(mktemp -d) &&
c++ -std=c++17 -O2 -Ihash-challenge/vendor \
  hash-challenge/verify_crunchy.cpp hash-challenge/vendor/*.cpp \
  -o "$verify_dir/verify_crunchy" &&
python3 -E -B hash-challenge/verify_results.py "$verify_dir/verify_crunchy" &&
python3 -E -B hash-challenge-Preimage/verify_results.py "$verify_dir/verify_crunchy" &&
python3 -E -B aes-challenge/verify_all_results.py
```

Expected results are 23 Keccak collisions, 11 Keccak preimage-suite checks (2 complete messages, 5 partial matches, 4 internal states), and 15 AES collisions plus three FIPS 197 known-answer vectors. Times in the tables are historical discovery times. Running the verification commands recomputes the expected outputs for the fixed inputs.

## Keccak collisions

[`hash-challenge`](hash-challenge/) checks that each [message pair](hash-challenge/collision_witnesses.json) has distinct inputs and matches its expected 160-bit digest. Two pairs also have equal complete sponge states after padded absorption. Here `b` is the state width, `r` is the rate, `c` is the capacity, and `start` is the zero-based starting round.

| `b` | `r / c` | Rounds | `start` | Pairs | Practical results |
| ---: | :--- | ---: | :--- | ---: | :--- |
| 200 | 40 / 160 | 2 | 3, 9 | 2 | Full 200-bit state match at start 9 (1,080- and 6,040-bit messages) |
| 800 | 640 / 160 | 3 | 2 | 1 | 638-bit messages |
| 800 | 640 / 160 | 4 | 0, 2 | 4 | 638-bit messages |
| 800 | 640 / 160 | 5 | 0, 2 | 6 | 638- and 1,278-bit witnesses. The fastest recorded 1,278-bit pair took 9.443 ms |
| 800 | 640 / 160 | 6 | 14 | 1 | Two 638-bit messages with digest `2fa7a934a40df4f99877d0fb3515c0ac58ce2dc7` |
| 1600 | 1440 / 160 | 5 | 0, 17, 19 | 7 | At start 0, a 1,438-bit pair in 0.899 ms and a 2,878-bit pair with a full 1,600-bit state match in 0.187 ms |
| 1600 | 1440 / 160 | 6 | 0, 18 | 2 | Two 1,438-bit pairs in 104.626 s and 146.579 s, respectively |

The `source` field in the collision fixture file gives the original project-relative record for each pair.

## Keccak preimages

[`hash-challenge-Preimage`](hash-challenge-Preimage/) checks [complete messages, partial digest matches, and raw permutation states](hash-challenge-Preimage/results.json) against 80-bit challenge targets. The complete-message checks start from the zero IV. Partial-match prefixes follow Keccak's least-significant-bit-first order.

| `b` | `r / c` | Rounds | `start` | Configuration | Verified result |
| ---: | :--- | ---: | ---: | :--- | :--- |
| 200 | 40 / 160 | 2 | 3 | Contest window (starts 0–16) | Complete 477-bit message matching `024a5518e1e95db53219` |
| 200 | 40 / 160 | 3 | 93 | Extended window (rounds 93–95, contest starts 0–15) | Complete 398-bit message matching `d8ed85692afbee4c99ce` |
| 1600 | 1440 / 160 | 5 | 0 | Contest window (starts 0–19) | Five 1,438-bit messages. The best samples match 65 of 80 bits overall and 34 leading bits, respectively |
| 1600 | Raw state | 5 | 73 | Extended window (rounds 73–77, contest starts 0–19) | Four archived internal states reproduce the 80-bit target under the raw permutation. The benchmark reported 45 matching states |

The partial-message and raw-state checks use target `653bc0f87d264f0857d0`. The raw-state check applies the permutation directly to a supplied state with nonzero capacity. The 477-bit vector is shorter than the archived 517-bit example.

The full-message records come from `work/verifier/b200_nr3_pre/verification_results.json` and `work/solved_s93_preimage/FULL_PREIMAGE_SOLVED.json`. The partial-match counts come from `work/verifier/b1600_nr5_pre/b1600_nr5_verification_results.json`. The raw-state samples come from `work/b1600_nr5_pre_v2/ext_window/live_m5pro_s73_homog_h6_bench.json`.

## AES collisions

[`aes-challenge`](aes-challenge/) embeds 15 collision witnesses in its [verification script](aes-challenge/verify_all_results.py). It checks distinct inputs, exact digests, and AES-128, AES-192 and AES-256 against FIPS 197 known-answer vectors. The two-block Davies–Meyer cases also check distinct first-block chaining values. SFS means semi-free-start with a shared IV.

| Suite | AES-128 construction | Rounds | IV setting | Pairs | Selected practical results |
| :--- | :--- | :--- | :--- | ---: | :--- |
| 1A | Davies–Meyer SFS | 4, 5 | Shared IV | 4 | 0.016 ms at 4 rounds and 0.625 s at 5 rounds |
| 1B | Davies–Meyer one-block fixed IV | 2, 3 | `ZERO-IV`, `AES-CRUNCHY-v1` | 3 | 3 rounds in 0.64 ms (`ZERO-IV`) and 2.65 ms (`AES-CRUNCHY-v1`) |
| 1C | Davies–Meyer two-block fixed IV | 4 | `ZERO-IV`, `AES-CRUNCHY-v1` | 2 | 589.784 s (`ZERO-IV`) and 157.012 s (`AES-CRUNCHY-v1`) |
| 2A | Matyas–Meyer–Oseas SFS | 6, 7 | Shared IV | 2 | 1.55 s at 6 rounds and 9.172 s at 7 rounds |
| 2B | Matyas–Meyer–Oseas fixed IV | 4, 5, 6 | `ZERO-IV`, `AES-CRUNCHY-v1` | 4 | 5 rounds in 0.052 s (`AES-CRUNCHY-v1`). At 6 rounds, the winning task in a distributed run took 99.62 s (`AES-CRUNCHY-v1`) |

## `cryptAnalysisAgent` paper cases

Run the same [verification commands](#verify-all-results) and locate the IDs below in the output. The paper's seven Keccak collision pairs, two Keccak preimages, and three AES-MMO pairs are included in the suite totals.

| Paper result | Fixture IDs |
| :--- | :--- |
| Keccak `b=200`, 2 rounds, start 9, full-state collision | `b200-2r-s09` |
| Keccak `b=800`, 5 and 6 rounds, starts 0 and 14 respectively, 638-bit collisions | `b800-5r-s00-638b-a`, `b800-6r-s14` |
| Keccak `b=1600`, 5 rounds, start 0, 1,438-bit collision and 2,878-bit full-state collision | `b1600-5r-s00-1438b-a`, `b1600-5r-s00-2878b-a` |
| Keccak `b=1600`, 6 rounds, starts 0 and 18, 1,438-bit collisions | `b1600-6r-s00`, `b1600-6r-s18` |
| Keccak `b=200`, 2-round contest and 3-round extended-window preimages | `b200-2r-start3-shortened`, `b200-3r-start93` |
| AES-128-MMO, 6- and 7-round SFS and 4-round `AES-CRUNCHY-v1` fixed-IV collisions | `2A-1`, `2A-2`, `2B-1` |

The original standalone Python checks and paper manifests remain available in the [first archive commit](https://github.com/OSR-Lab/WishfulCryptanalysis/tree/6dcc94a4f2db57dcd38a072ea6c265fae754638d/cryptAnalysisAgent/).

## Reference code

The vendored Keccak reference code is from KeccakTeam/KeccakTools at commit `3473478`. It retains its CC0 notices and uses C++17-compatible array ownership for the sponge state. [KeccakTools source](https://github.com/KeccakTeam/KeccakTools/tree/3473478bf9c10bf95879cd8960c7409fee313162/Sources)
