#!/usr/bin/env python3
"""
AES Crunchy Crypto Contest — Collision Verifier

  Suite 1: AES-DM Collisions  (H_i = AES_{M_i}^{(nr)}(H_{i-1}) ^ H_{i-1})
    - 1A: Semi-Free-Start (SFS) Collision  -> submit (IV, K1, K2)
    - 1B: Single-Block Collision           -> fixed IV, submit (K1, K2)
    - 1C: Two-Block Collision              -> fixed IV, submit ((M1, M2), (M1', M2')) with H1 != H1'

  Suite 2: AES-128-MMO Collisions  (H_i = AES_{H_{i-1}}^{(nr)}(M_i) ^ M_i)
    - 2A: Semi-Free-Start (SFS) Collision  -> submit (H0, M1, M2)
    - 2B: Real Collision (1- or 2-Block)   -> fixed IV, submit (M, M') of equal block length
"""

from __future__ import annotations
import hashlib
from typing import List, Tuple

SBOX = [
    0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
    0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
    0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
    0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
    0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
    0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
    0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
    0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
    0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
    0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
    0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
    0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
    0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
    0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
    0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
    0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
]
RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d]
SR = [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11]

DEFAULT_SEASON = "AES-CRUNCHY-v1"
FULL_ROUNDS = {128: 10, 192: 12, 256: 14}


def _xtime(a: int) -> int:
    return ((a << 1) ^ 0x1b) & 0xff if (a & 0x80) else (a << 1)


def _mix_col(c: List[int]) -> List[int]:
    t = c[0] ^ c[1] ^ c[2] ^ c[3]
    return [
        c[0] ^ t ^ _xtime(c[0] ^ c[1]),
        c[1] ^ t ^ _xtime(c[1] ^ c[2]),
        c[2] ^ t ^ _xtime(c[2] ^ c[3]),
        c[3] ^ t ^ _xtime(c[3] ^ c[0]),
    ]


def key_expansion(key: bytes, nr: int) -> List[List[int]]:
    nk = len(key) // 4
    if nk not in (4, 6, 8):
        raise ValueError(f"Invalid AES key length: {len(key)} bytes")
    total_words = 4 * (nr + 1)
    w = [list(key[4 * i : 4 * i + 4]) for i in range(nk)]
    for i in range(nk, total_words):
        temp = w[i - 1][:]
        if i % nk == 0:
            temp = [SBOX[temp[1]] ^ RCON[i // nk], SBOX[temp[2]], SBOX[temp[3]], SBOX[temp[0]]]
        elif nk == 8 and i % nk == 4:
            temp = [SBOX[b] for b in temp]
        w.append([w[i - nk][j] ^ temp[j] for j in range(4)])
    return [sum(w[4 * r : 4 * r + 4], []) for r in range(nr + 1)]


def aes_reduced_encrypt(key: bytes, pt: bytes, nr: int) -> bytes:
    """Standard FIPS-197 reduced-round AES: final round nr omits MixColumns."""
    key_bits = len(key) * 8
    if len(pt) != 16 or not (1 <= nr <= FULL_ROUNDS[key_bits]):
        raise ValueError("Invalid plaintext length or round count")
    rks = key_expansion(key, nr)
    s = [pt[i] ^ rks[0][i] for i in range(16)]
    for r in range(1, nr):
        s = [SBOX[b] for b in s]
        s = [s[SR[i]] for i in range(16)]
        s = sum([_mix_col(s[4 * c : 4 * c + 4]) for c in range(4)], [])
        s = [s[i] ^ rks[r][i] for i in range(16)]
    s = [SBOX[b] for b in s]
    s = [s[SR[i]] for i in range(16)]
    s = [s[i] ^ rks[nr][i] for i in range(16)]
    return bytes(s)


def _xor(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))


def derive_iv(challenge_id: str, season: str = DEFAULT_SEASON) -> bytes:
    """Nothing-up-my-sleeve 128-bit IV for fixed-IV collision challenges."""
    if season == "ZERO-IV":
        return b"\x00" * 16
    return hashlib.shake_256(f"{season}|IV|{challenge_id}".encode()).digest(16)


# ============================================================================
# Suite 1: Standard AES-DM Verifiers (H_i = AES_{M_i}^{(nr)}(H_{i-1}) ^ H_{i-1})
# ============================================================================

def verify_1a_dm_sfs(key_bits: int, nr: int, iv_hex: str, k1_hex: str, k2_hex: str) -> Tuple[bool, str]:
    iv, k1, k2 = bytes.fromhex(iv_hex), bytes.fromhex(k1_hex), bytes.fromhex(k2_hex)
    if len(iv) != 16 or len(k1) * 8 != key_bits or len(k2) * 8 != key_bits:
        return False, "Invalid byte lengths"
    if k1 == k2:
        return False, "K1 and K2 must be distinct"
    h1 = _xor(aes_reduced_encrypt(k1, iv, nr), iv)
    h2 = _xor(aes_reduced_encrypt(k2, iv, nr), iv)
    return h1 == h2, f"H1={h1.hex()} H2={h2.hex()}"


def verify_1b_dm_single_block(
    key_bits: int, nr: int, k1_hex: str, k2_hex: str, season: str = DEFAULT_SEASON
) -> Tuple[bool, str]:
    iv = derive_iv(f"1B|AES-{key_bits}-DM|r={nr}", season)
    return verify_1a_dm_sfs(key_bits, nr, iv.hex(), k1_hex, k2_hex)


def verify_1c_dm_two_block(
    key_bits: int, nr: int, m1_hex: str, m2_hex: str, season: str = DEFAULT_SEASON
) -> Tuple[bool, str]:
    iv = derive_iv(f"1C|AES-{key_bits}-DM|r={nr}", season)
    blk = key_bits // 8
    m1, m2 = bytes.fromhex(m1_hex), bytes.fromhex(m2_hex)
    if len(m1) != 2 * blk or len(m2) != 2 * blk or m1 == m2:
        return False, "Messages must be distinct 2-block inputs"
    h1_a = _xor(aes_reduced_encrypt(m1[:blk], iv, nr), iv)
    h1_b = _xor(aes_reduced_encrypt(m2[:blk], iv, nr), iv)
    if h1_a == h1_b:
        return False, "Degenerate 1-block collision (H1 == H1'); must be a genuine 2-block collision"
    h2_a = _xor(aes_reduced_encrypt(m1[blk:], h1_a, nr), h1_a)
    h2_b = _xor(aes_reduced_encrypt(m2[blk:], h1_b, nr), h1_b)
    return h2_a == h2_b, f"H2={h2_a.hex()} H2'={h2_b.hex()}"


# ============================================================================
# Suite 2: Standard AES-128-MMO Verifiers (H_i = AES_{H_{i-1}}^{(nr)}(M_i) ^ M_i)
# ============================================================================

def verify_2a_mmo_sfs(nr: int, h0_hex: str, m1_hex: str, m2_hex: str) -> Tuple[bool, str]:
    h0, m1, m2 = bytes.fromhex(h0_hex), bytes.fromhex(m1_hex), bytes.fromhex(m2_hex)
    if len(h0) != 16 or len(m1) != 16 or len(m2) != 16 or m1 == m2:
        return False, "Inputs must be 16-byte blocks with M1 != M2"
    d1 = _xor(aes_reduced_encrypt(h0, m1, nr), m1)
    d2 = _xor(aes_reduced_encrypt(h0, m2, nr), m2)
    return d1 == d2, f"D1={d1.hex()} D2={d2.hex()}"


def verify_2b_mmo_real(
    nr: int, m1_hex: str, m2_hex: str, season: str = DEFAULT_SEASON
) -> Tuple[bool, str]:
    iv = derive_iv(f"2B|AES-128-MMO|r={nr}", season)
    m1, m2 = bytes.fromhex(m1_hex), bytes.fromhex(m2_hex)
    if len(m1) != len(m2) or len(m1) not in (16, 32) or m1 == m2:
        return False, "M1 and M2 must be distinct and both 16B (1-block) or both 32B (2-block)"
    blocks = len(m1) // 16
    ha, hb = iv, iv
    for i in range(blocks):
        ba, bb = m1[16 * i : 16 * (i + 1)], m2[16 * i : 16 * (i + 1)]
        ha = _xor(aes_reduced_encrypt(ha, ba, nr), ba)
        hb = _xor(aes_reduced_encrypt(hb, bb, nr), bb)
        if blocks == 2 and i == 0 and ha == hb:
            return False, "Degenerate 1-block collision at block 1 (H1 == H1')"
    return ha == hb, f"H(M1)={ha.hex()} H(M2)={hb.hex()}"
