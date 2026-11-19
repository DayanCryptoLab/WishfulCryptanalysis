# Keccak Crunchy collision results

The [collision witnesses](collision_witnesses.json) contain 23 recorded reduced-round Keccak message pairs. Each pair gives the rate, capacity, round count, starting round, message lengths in bits, and expected 160-bit digest. The original project-relative path for each record is in its `source` field.

| Width | Rounds | Start rounds | Pairs | Highlights |
| ---: | ---: | :--- | ---: | :--- |
| 200 | 2 | 3, 9 | 2 | Full 200-bit sponge-state equality at start 9 |
| 800 | 3 | 2 | 1 | Two 638-bit messages |
| 800 | 4 | 0, 2 | 4 | Four distinct 638-bit pairs |
| 800 | 5 | 0, 2 | 6 | 638-bit and 1,278-bit pairs. The fastest recorded 1,278-bit pair took 9.443 ms |
| 800 | 6 | 14 | 1 | Two 638-bit messages with digest `2fa7a934a40df4f99877d0fb3515c0ac58ce2dc7` |
| 1,600 | 5 | 0, 17, 19 | 7 | 1,438-bit equal-length pair in 0.899 ms and 2,878-bit pair in 0.187 ms with full 1,600-bit sponge-state equality |
| 1,600 | 6 | 0, 18 | 2 | Two equal-length 1,438-bit pairs in 104.626 s and 146.579 s |

The times are the elapsed times recorded by the original experiments. The verifier checks message distinctness at the recorded bit lengths, digest equality, and the exact expected digest. The two entries marked `full_state` also check equality of every bit of the sponge state after padded absorption.

The seven collision witnesses in the [paper campaign](../cryptAnalysisAgent/paper/case-studies/keccak-6r/campaign_witnesses.json) overlap this collection. The `b800-6r-s14` pair is also the paper's standalone Keccak witness. The recorded [preimages](../hash-challenge-Preimage/) are verified separately.

## Verify

From the repository root, build the reference verifier with a C++17 compiler and run it with Python 3. The check uses the archived witnesses and runs offline.

```sh
verify_dir=$(mktemp -d)
c++ -std=c++17 -O2 -Ihash-challenge/vendor/KeccakTools \
  hash-challenge/src/verify_crunchy.cpp hash-challenge/vendor/KeccakTools/*.cpp \
  -o "$verify_dir/verify_crunchy"
python3 -B hash-challenge/verify_results.py "$verify_dir/verify_crunchy"
```

The vendored KeccakTools sources come from [KeccakTeam/KeccakTools at `3473478`](https://github.com/KeccakTeam/KeccakTools/tree/3473478bf9c10bf95879cd8960c7409fee313162/Sources) and retain their CC0 notices. The sponge-state buffer uses C++17-compatible array ownership.
