#!/usr/bin/env python3
"""
Verify the 16 recorded AES Crunchy Contest collision witnesses and the FIPS 197
known-answer test vectors using the local collision verifier and the standard library.
"""

from __future__ import annotations
import time
from typing import List, Tuple

from aes_crunchy_contest import (
    SBOX,
    SR,
    _mix_col,
    _xor,
    aes_reduced_encrypt,
    derive_iv,
    key_expansion,
    verify_1a_dm_sfs,
    verify_1b_dm_single_block,
    verify_1c_dm_two_block,
    verify_2a_mmo_sfs,
    verify_2b_mmo_real,
)


def _mask16(diff_bytes: bytes) -> int:
    m = 0
    for i in range(16):
        if diff_bytes[i] != 0:
            m |= 1 << i
    return m


def _popc(x: int) -> int:
    return bin(x).count("1")


def _trace_rounds(key: bytes, pt: bytes, nr: int) -> Tuple[List[bytes], List[bytes], bytes]:
    """Traces FIPS-197 reduced-round AES and returns (round_keys, X_1..X_nr, ciphertext)."""
    rks = [bytes(rk) for rk in key_expansion(key, nr)]
    x_rounds: List[bytes] = []
    s = [pt[i] ^ rks[0][i] for i in range(16)]
    for r in range(1, nr):
        x_rounds.append(bytes(s))
        s = [SBOX[b] for b in s]
        s = [s[SR[i]] for i in range(16)]
        s = sum([_mix_col(s[4 * c : 4 * c + 4]) for c in range(4)], [])
        s = [s[i] ^ rks[r][i] for i in range(16)]
    x_rounds.append(bytes(s))
    s = [SBOX[b] for b in s]
    s = [s[SR[i]] for i in range(16)]
    c_out = bytes(s[i] ^ rks[nr][i] for i in range(16))
    assert c_out == aes_reduced_encrypt(key, pt, nr)
    return rks, x_rounds, c_out


def _count_ks_active_sboxes_128(rks1: List[bytes], rks2: List[bytes], nr: int) -> int:
    return sum(
        1
        for r in range(1, nr + 1)
        for j in range(12, 16)
        if rks1[r - 1][j] != rks2[r - 1][j]
    )


def main() -> None:
    t0 = time.perf_counter()
    total_verified = 0

    print("================================================================================")
    print("  AES Crunchy Crypto Contest — Fixed Witness Verification")
    print("================================================================================")

    # -------------------------------------------------------------------------
    # 0. FIPS-197 Standard Test Vectors
    # -------------------------------------------------------------------------
    pt_fips = bytes.fromhex("00112233445566778899aabbccddeeff")
    assert (
        aes_reduced_encrypt(bytes.fromhex("000102030405060708090a0b0c0d0e0f"), pt_fips, 10).hex()
        == "69c4e0d86a7b0430d8cdb78070b4c55a"
    )
    assert (
        aes_reduced_encrypt(bytes.fromhex("000102030405060708090a0b0c0d0e0f1011121314151617"), pt_fips, 12).hex()
        == "dda97ca4864cdfe06eaf70a0ec0d7191"
    )
    assert (
        aes_reduced_encrypt(
            bytes.fromhex("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"),
            pt_fips,
            14,
        ).hex()
        == "8ea2b7ca516745bfeafc49904b496089"
    )
    print("[PASS] FIPS-197 Appendix C (AES-128 / AES-192 / AES-256) standard vectors verified.\n")

    # -------------------------------------------------------------------------
    # 1. Suite 1-A: AES-128-DM Semi-Free-Start (SFS) Collisions
    # -------------------------------------------------------------------------
    print("--- [Suite 1-A] AES-128-DM Semi-Free-Start (SFS) Collisions ---")
    suite_1a = [
        (
            "1A-1 | 4-round semi-free-start collision",
            4,
            "543a40133874eff99ef33f7dd075a995",
            "b4570042429ba0636e00150723c08100",
            "b45700424691a0636a00150723c08100",
            "4b886bcd3829b20b825eef090b2dc354",
        ),
        (
            "1A-2 | 4-round semi-free-start collision",
            4,
            "d160281e0a7f4695197c0806f219e8cd",
            "f1e8d4cde895092569bcd707617f43c7",
            "f0e8d4c6e895092e69bcd707617f43c7",
            "027231d01d442c8e2527f4d970c850fb",
        ),
        (
            "1A-3 | 5-round semi-free-start collision",
            5,
            "e8812f05db9df9130fce3aa637a6e03c",
            "80d7347859bca72da6894acfc6d069ac",
            "8cd7347255bca72da6894ac5c6d069ac",
            "bfb1bf0c571a3456c0b53e76c274db02",
        ),
        (
            "1A-4 | 5-round semi-free-start collision",
            5,
            "15a6b0cd30505b60cc980fec9589313b",
            "8d49097504859c56f5cbe857e2ee4022",
            "bc49090635859c56f5cbe824e2ee4022",
            "85e084015dd6e7847aba802081ecaab1",
        ),
        (
            "1A-5 | 6-round semi-free-start collision",
            6,
            "66245e28c3510e1e47921e992ecf74d0",
            "161873bf4d4c3886c804b12e11276780",
            "1618b6bf19893886c880b12e11e2a280",
            "b1266254e612b1084d1fa719acc45621",
        ),
    ]
    for label, nr, iv_h, k1_h, k2_h, exp_d in suite_1a:
        ok, info = verify_1a_dm_sfs(128, nr, iv_h, k1_h, k2_h)
        assert ok and f"H1={exp_d} H2={exp_d}" == info, f"FAILED {label}: {info}"
        rks1, x1, _ = _trace_rounds(bytes.fromhex(k1_h), bytes.fromhex(iv_h), nr)
        rks2, x2, _ = _trace_rounds(bytes.fromhex(k2_h), bytes.fromhex(iv_h), nr)
        s_key = _count_ks_active_sboxes_128(rks1, rks2, nr)
        w_rounds = [_popc(_mask16(_xor(a, b))) for a, b in zip(x1, x2)]
        total_verified += 1
        print(f"  [PASS] {label}")
        print(f"         Digest={exp_d} | w_state={w_rounds}, S_key={s_key}, S_tot={sum(w_rounds)+s_key}")

    # -------------------------------------------------------------------------
    # 2. Suite 1-B: AES-128-DM Single-Block Fixed-IV Collisions
    # -------------------------------------------------------------------------
    print("\n--- [Suite 1-B] AES-128-DM Single-Block Fixed-IV Collisions ---")
    suite_1b = [
        (
            "1B-1 | 2-round fixed-IV baseline (ZERO-IV)",
            2,
            "ZERO-IV",
            "863d65fb7473aa5a0a97956f5647d0a8",
            "123dedfb4ab4aa5acd861d6f5680d0a8",
            "b01835a23e915749dc39716aa781face",
        ),
        (
            "1B-2 | 3-round fixed-IV collision (ZERO-IV)",
            3,
            "ZERO-IV",
            "6e5f6fb21897ec23195a2d4d3d1b9ad7",
            "cf5f6fb21897ec23d723b04d3d1f07d7",
            "f0007c4148f4c951e9e12dca055752a9",
        ),
        (
            "1B-3 | 3-round fixed-IV collision (AES-CRUNCHY-v1)",
            3,
            "AES-CRUNCHY-v1",
            "3d8765013f308156ee99f217c51eb822",
            "3b8765013f30815638ce6f17c51a2522",
            "568d58a1fd75905f431b38c76790558d",
        ),
    ]
    for label, nr, season, k1_h, k2_h, exp_d in suite_1b:
        ok, info = verify_1b_dm_single_block(128, nr, k1_h, k2_h, season=season)
        assert ok and f"H1={exp_d} H2={exp_d}" == info, f"FAILED {label}: {info}"
        iv = derive_iv(f"1B|AES-128-DM|r={nr}", season)
        rks1, x1, _ = _trace_rounds(bytes.fromhex(k1_h), iv, nr)
        rks2, x2, _ = _trace_rounds(bytes.fromhex(k2_h), iv, nr)
        s_key = _count_ks_active_sboxes_128(rks1, rks2, nr)
        w_rounds = [_popc(_mask16(_xor(a, b))) for a, b in zip(x1, x2)]
        total_verified += 1
        print(f"  [PASS] {label}")
        print(f"         IV={iv.hex()} | Digest={exp_d} | w_state={w_rounds}, S_key={s_key}, S_tot={sum(w_rounds)+s_key}")

    # -------------------------------------------------------------------------
    # 3. Suite 1-C: AES-128-DM Two-Block Fixed-IV Collisions (H1 != H1')
    # -------------------------------------------------------------------------
    print("\n--- [Suite 1-C] AES-128-DM Two-Block Fixed-IV Collisions (H1 != H1') ---")
    suite_1c = [
        (
            "1C-1 | 4-round two-block fixed-IV collision (ZERO-IV)",
            4,
            "ZERO-IV",
            "ffe1a3ec9884b7263031425f52344d445a4e290c72c37d781e6d40ecd82205d0",
            "2718d6f4fc3acd753031425f52344d446f4e64aa47c37dea2b6da889ed2205b5",
            "7400d3c44c4c7a0ed827f3f00ca8b453",
            "d600d356794c7a63ed27679539e2b46e",
            "59490eaef4388d512dd6bb017c5eb2f2",
        ),
        (
            "1C-2 | 4-round two-block fixed-IV collision (AES-CRUNCHY-v1)",
            4,
            "AES-CRUNCHY-v1",
            "aee4d40ec593e86e3031425f52344d44d1219dcda7cd2d5803e9aebe8fbf1e2e",
            "f8f2437bdd19042e3031425f52344d4495211a1ae3cd2de347e9622dcbbf1ebd",
            "45d32f705ece1a032b9fb62d773568ff",
            "91d32fcb1ace1a5b6f9f0fbe334a6825",
            "4935372ee0700a273ec779f52d90a254",
        ),
    ]
    for label, nr, season, m1_h, m2_h, exp_h1, exp_h1p, exp_h2 in suite_1c:
        ok, info = verify_1c_dm_two_block(128, nr, m1_h, m2_h, season=season)
        assert ok and f"H2={exp_h2} H2'={exp_h2}" == info, f"FAILED {label}: {info}"
        iv = derive_iv(f"1C|AES-128-DM|r={nr}", season)
        m1, m2 = bytes.fromhex(m1_h), bytes.fromhex(m2_h)
        h1 = _xor(aes_reduced_encrypt(m1[:16], iv, nr), iv)
        h1p = _xor(aes_reduced_encrypt(m2[:16], iv, nr), iv)
        assert h1 != h1p and h1.hex() == exp_h1 and h1p.hex() == exp_h1p
        rks1, x1, _ = _trace_rounds(m1[16:], h1, nr)
        rks2, x2, _ = _trace_rounds(m2[16:], h1p, nr)
        s_key = _count_ks_active_sboxes_128(rks1, rks2, nr)
        w_rounds = [_popc(_mask16(_xor(a, b))) for a, b in zip(x1, x2)]
        total_verified += 1
        print(f"  [PASS] {label}")
        print(f"         IV={iv.hex()} | H1 != H1' OK | H2={exp_h2} | B2 w_state={w_rounds}, S_key={s_key}, S_tot={sum(w_rounds)+s_key}")

    # -------------------------------------------------------------------------
    # 4. Suite 2-A: AES-128-MMO Semi-Free-Start (SFS) Collisions
    # -------------------------------------------------------------------------
    print("\n--- [Suite 2-A] AES-128-MMO Semi-Free-Start (SFS) Collisions ---")
    suite_2a = [
        (
            "2A-1 | 6-round semi-free-start collision",
            6,
            "60d82880aca791934af9b35dafcef409",
            "1a0af8e664575588db50116f69cb591e",
            "ff0af8e664575588db50e86f69cb591e",
            "5164ed4890411a7b16f471869f15d35d",
            None,
        ),
        (
            "2A-2 | 7-round semi-free-start collision",
            7,
            "94e3928fed6920de101cffbb850bbb33",
            "862eaa82493a23d97d096f1a2a19522e",
            "862ef882492d23d934096f1a2a19521a",
            "d6c61a5aa20d682c64f86cc33cf5d571",
            (0x8124, 0x0B0E, 0xDD70, 0xFFFF, 0x2184, 0x0100, 0x0F00),
        ),
    ]
    for label, nr, h0_h, m1_h, m2_h, exp_d, expected_masks in suite_2a:
        ok, info = verify_2a_mmo_sfs(nr, h0_h, m1_h, m2_h)
        assert ok and f"D1={exp_d} D2={exp_d}" == info, f"FAILED {label}: {info}"
        _, x1, _ = _trace_rounds(bytes.fromhex(h0_h), bytes.fromhex(m1_h), nr)
        _, x2, _ = _trace_rounds(bytes.fromhex(h0_h), bytes.fromhex(m2_h), nr)
        masks = tuple(_mask16(_xor(a, b)) for a, b in zip(x1, x2))
        if expected_masks is not None:
            assert masks == expected_masks, f"FAILED {label}: active-byte masks differ"
        w_rounds = [_popc(mask) for mask in masks]
        total_verified += 1
        print(f"  [PASS] {label}")
        print(f"         H0={h0_h} | Digest={exp_d} | w_rounds={w_rounds} (S_tot={sum(w_rounds)})")

    # -------------------------------------------------------------------------
    # 5. Suite 2-B: AES-128-MMO Fixed-IV Real Collisions
    # -------------------------------------------------------------------------
    print("\n--- [Suite 2-B] AES-128-MMO Fixed-IV Real Collisions ---")
    suite_2b = [
        (
            "2B-1 | 4-round fixed-IV collision (AES-CRUNCHY-v1)",
            4,
            "AES-CRUNCHY-v1",
            "4705737446ae865d2d43cf47074e8cb6",
            "5f8ae37446ae865d2d43cf47074e8cb6",
            "20c171061d8dbaa3a5531553b6053e65",
            "2f02bfba267658654de507c7858068a9",
        ),
        (
            "2B-2 | 5-round fixed-IV collision (AES-CRUNCHY-v1)",
            5,
            "AES-CRUNCHY-v1",
            "a2421d463d8f1dee82c2cc45765806a8",
            "5d421d463d8f1dee82c2cc45765806a8",
            "d628bd350a8000577378a8bffbd2d815",
            None,
        ),
        (
            "2B-3 | 5-round fixed-IV collision (ZERO-IV)",
            5,
            "ZERO-IV",
            "0b555c5f59bc5c2c27c50649b216abd9",
            "df555c5f59bc5c2c27c50649b216abd9",
            "ca42a7bbeb903f84a2a855a0ea2301ae",
            None,
        ),
        (
            "2B-4 | 6-round fixed-IV collision (AES-CRUNCHY-v1)",
            6,
            "AES-CRUNCHY-v1",
            "9f80b4980381ee0bf0a0bb6d817af843",
            "9f80cd980381ee0b43a0bb6d817af843",
            "12a40539bdff08c1e9b42e2f0e9a35e6",
            None,
        ),
    ]
    for label, nr, season, m1_h, m2_h, exp_d, expected_iv_hex in suite_2b:
        ok, info = verify_2b_mmo_real(nr, m1_h, m2_h, season=season)
        assert ok and f"H(M1)={exp_d} H(M2)={exp_d}" == info, f"FAILED {label}: {info}"
        iv = derive_iv(f"2B|AES-128-MMO|r={nr}", season)
        if expected_iv_hex is not None:
            assert iv.hex() == expected_iv_hex, f"FAILED {label}: derived IV differs"
        _, x1, _ = _trace_rounds(iv, bytes.fromhex(m1_h), nr)
        _, x2, _ = _trace_rounds(iv, bytes.fromhex(m2_h), nr)
        w_rounds = [_popc(_mask16(_xor(a, b))) for a, b in zip(x1, x2)]
        total_verified += 1
        print(f"  [PASS] {label}")
        print(f"         IV={iv.hex()} | Digest={exp_d} | w_rounds={w_rounds} (S_tot={sum(w_rounds)})")

    dt_ms = (time.perf_counter() - t0) * 1000.0
    print("\n================================================================================")
    print(f"  Verified {total_verified} collision witnesses and the FIPS 197 test vectors ({dt_ms:.2f} ms).")
    print("================================================================================")


if __name__ == "__main__":
    main()
