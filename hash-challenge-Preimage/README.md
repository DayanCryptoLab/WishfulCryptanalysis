# Keccak preimage results

| Keccak parameters | Start round | Round window | Verified result |
| --- | ---: | --- | --- |
| `r=40, c=160, nr=2` | 3 | Contest (`0–16`) | 477-bit zero-IV message matching the 80-bit challenge digest. The archived 2023 example is 517 bits. |
| `r=40, c=160, nr=3` | 93 | Extended (contest `0–15`) | 398-bit zero-IV message matching the 80-bit challenge digest in the extended round window. |
| `r=1440, c=160, nr=5` | 0 | Contest (`0–19`) | Five 1,438-bit messages with partial digest matches. The best samples match 65 of 80 bits overall and 34 consecutive bits from the start, respectively. |
| `b=1600, nr=5` | 73 | Extended (contest `0–19`) | The benchmark observed 45 matching internal states. Four archived state samples each reproduce the 80-bit challenge digest prefix under the raw permutation. Each archived state has nonzero capacity, so verifying a complete zero-IV message would require a separate witness. |

## Verify locally

Follow the [shared Keccak verifier build instructions](../hash-challenge/README.md). From the repository root in the same shell, run:

```sh
python3 -B hash-challenge-Preimage/verify_results.py "$verify_dir/verify_crunchy"
```

The runner verifies both full preimage messages with the Crunchy Contest sponge. For partial matches, it recomputes the 80-bit digest and checks both match counts against the challenge digest, using least-significant-bit-first Keccak ordering for the leading bits. It runs the forward permutation for the four state samples in [results.json](results.json).

## Result provenance

- The shortened 477-bit message comes from `work/verifier/b200_nr3_pre/verification_results.json` in the source project.
- The 398-bit extended-window message comes from `work/solved_s93_preimage/FULL_PREIMAGE_SOLVED.json`.
- The four state samples and the reported count of 45 come from `work/b1600_nr5_pre_v2/ext_window/live_m5pro_s73_homog_h6_bench.json`.
- The five partial-match messages come from the `cpp_d32_bench_and_verified_prefix.json`, `b1600_nr5_pre_milp_results.json`, and `fes_benchmark_results.json` artifacts. Their expected digests and counts come from `work/verifier/b1600_nr5_pre/b1600_nr5_verification_results.json`.
