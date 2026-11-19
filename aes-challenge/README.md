# AES Crunchy Contest practical results

The challenge's 15 recorded collision witnesses are embedded in [verify_all_results.py](verify_all_results.py). The script checks distinct inputs, recomputes the expected digests using the [AES challenge collision verifier](aes_crunchy_contest.py), and runs the AES-128, AES-192, and AES-256 FIPS 197 known-answer tests. The two-block Davies–Meyer cases also require distinct first-block chaining values.

Run from the repository root with Python 3 using its standard library and default assertion settings.

```sh
python3 -E -B aes-challenge/verify_all_results.py
```

The table follows the original AES challenge `RESULTS.md` and the verifier's case IDs. Times are historical measurements. The last row reports the time for the task that found the witness in a distributed run.

| Witness | Reduced-round result | IV setting | Reported time |
| --- | --- | --- | --- |
| 1A-1 | 4-round AES-128-DM semi-free-start collision | Shared IV | 0.016 ms |
| 1A-2 | 4-round AES-128-DM semi-free-start collision | Shared IV | 1.77 ms |
| 1A-3 | 5-round AES-128-DM semi-free-start collision | Shared IV | 0.625 s |
| 1A-4 | 5-round AES-128-DM semi-free-start collision | Shared IV | 28.23 s |
| 1B-1 | 2-round AES-128-DM single-block fixed-IV collision, literature baseline | `ZERO-IV` | — |
| 1B-2 | 3-round AES-128-DM single-block fixed-IV collision | `ZERO-IV` | 0.64 ms |
| 1B-3 | 3-round AES-128-DM single-block fixed-IV collision | `AES-CRUNCHY-v1` | 2.65 ms |
| 1C-1 | 4-round AES-128-DM two-block fixed-IV collision | `ZERO-IV` | 589.784 s |
| 1C-2 | 4-round AES-128-DM two-block fixed-IV collision | `AES-CRUNCHY-v1` | 157.012 s |
| 2A-1 | 6-round AES-128-MMO semi-free-start collision | Shared IV | 1.55 s |
| 2A-2 | 7-round AES-128-MMO semi-free-start collision | Shared IV | 9.172 s |
| 2B-1 | 4-round AES-128-MMO fixed-IV collision | `AES-CRUNCHY-v1` | < 0.1 s |
| 2B-2 | 5-round AES-128-MMO fixed-IV collision | `AES-CRUNCHY-v1` | 0.052 s |
| 2B-3 | 5-round AES-128-MMO fixed-IV collision | `ZERO-IV` | 23.518 s |
| 2B-4 | 6-round AES-128-MMO fixed-IV collision | `AES-CRUNCHY-v1` | 99.62 s (winning task) |
