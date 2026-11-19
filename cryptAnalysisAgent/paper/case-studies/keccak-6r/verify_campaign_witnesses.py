"""Zero-dependency standard-library verifier for the Keccak Crunchy Contest witnesses.

Recomputes reduced-round Keccak[r, c] sponge digests across widths b in {200, 400, 800, 1600}
with MultiRatePadding (pad10*1), multi-squeeze support, and official KeccakTools LFSR86540
round constants (strictly checking nominal round windows unless explicitly flagged as an
extended LFSR window).
Run: python3 paper/case-studies/keccak-6r/verify_campaign_witnesses.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROTATIONS = [
    [0, 36, 3, 41, 18], [1, 44, 10, 45, 2], [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56], [27, 20, 39, 8, 14],
]


def _build_lfsr_rc64() -> list[int]:
    """Generate all 255 official KeccakTools LFSR86540 64-bit round constants."""
    state = 0x01
    constants: list[int] = []
    for _ in range(255):
        c = 0
        for j in range(7):
            bit_pos = (1 << j) - 1
            bit = (state & 0x01) != 0
            if (state & 0x80) != 0:
                state = ((state << 1) ^ 0x71) & 0xFF
            else:
                state = (state << 1) & 0xFF
            if bit:
                c ^= 1 << bit_pos
        constants.append(c)
    return constants


RC64_LFSR = _build_lfsr_rc64()


def rotl(val: int, shift: int, w: int) -> int:
    mask = (1 << w) - 1
    shift %= w
    return ((val << shift) | (val >> ((w - shift) % w))) & mask


def keccak_f(state: list[list[int]], w: int, start: int, rounds: int) -> list[list[int]]:
    mask = (1 << w) - 1
    for ir in range(start, start + rounds):
        parity = [state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4] for x in range(5)]
        theta = [parity[(x - 1) % 5] ^ rotl(parity[(x + 1) % 5], 1, w) for x in range(5)]
        linear = [[0] * 5 for _ in range(5)]
        for x in range(5):
            for y in range(5):
                linear[y][(2 * x + 3 * y) % 5] = rotl(state[x][y] ^ theta[x], ROTATIONS[x][y], w)
        state = [[linear[x][y] ^ ((~linear[(x + 1) % 5][y] & mask) & linear[(x + 2) % 5][y])
                  for y in range(5)] for x in range(5)]
        state[0][0] ^= RC64_LFSR[ir] & mask
    return state


def pad_multirate(msg_hex: str, bitlen: int, rate: int) -> tuple[bytes, bytes]:
    raw = bytearray.fromhex(msg_hex)
    needed_bytes = (bitlen + 7) // 8
    if len(raw) < needed_bytes:
        raise ValueError(f"Message hex shorter than {bitlen} bits.")
    eff = bytearray(raw[:needed_bytes])
    rem = bitlen % 8
    if rem:
        eff[-1] &= (1 << rem) - 1
    total_bits = ((bitlen + 2 + rate - 1) // rate) * rate
    buf = bytearray(total_bits // 8)
    buf[:len(eff)] = eff
    buf[bitlen // 8] ^= 1 << (bitlen % 8)
    buf[(total_bits - 1) // 8] ^= 1 << ((total_bits - 1) % 8)
    return bytes(eff), bytes(buf)


def sponge_hash(
    msg_hex: str, bitlen: int, width: int, rate: int, capacity: int,
    start: int, rounds: int, out_bits: int, *, window_mode: str = "nominal",
) -> tuple[bytes, str]:
    assert width == rate + capacity and width in (200, 400, 800, 1600)
    w = width // 25
    max_rounds = 12 + 2 * (w.bit_length() - 1)
    assert rate > 0 and rate % 8 == 0 and out_bits > 0 and out_bits % 8 == 0
    if window_mode == "nominal":
        assert 0 <= start and rounds >= 1 and start + rounds <= max_rounds
    elif window_mode == "extended_lfsr":
        assert max_rounds < start + rounds <= 255 and rounds >= 1
    else:
        raise ValueError(f"Unknown window_mode: {window_mode!r}")
    lane_bytes = w // 8
    rate_bytes = rate // 8
    eff, padded = pad_multirate(msg_hex, bitlen, rate)
    state = [[0] * 5 for _ in range(5)]
    for offset in range(0, len(padded), rate_bytes):
        block = padded[offset:offset + rate_bytes]
        for idx in range(0, rate_bytes, lane_bytes):
            lane_idx = idx // lane_bytes
            x, y = lane_idx % 5, lane_idx // 5
            state[x][y] ^= int.from_bytes(block[idx:idx + lane_bytes], "little")
        state = keccak_f(state, w, start, rounds)
    out = bytearray()
    out_bytes = out_bits // 8
    while len(out) < out_bytes:
        state_bytes = bytearray()
        for y in range(5):
            for x in range(5):
                state_bytes.extend(state[x][y].to_bytes(lane_bytes, "little"))
        out.extend(state_bytes[:rate_bytes])
        if len(out) < out_bytes:
            state = keccak_f(state, w, start, rounds)
    return eff, bytes(out[:out_bytes]).hex()


def verify_all(path: Path) -> None:
    manifest = json.loads(path.read_text())
    for item in manifest["collisions"]:
        wmode = item.get("window_mode", "nominal")
        eff1, d1 = sponge_hash(item["msg1_hex"], item["bitlen1"], item["width"], item["rate"],
                               item["capacity"], item["start"], item["rounds"], item["output_bits"], window_mode=wmode)
        eff2, d2 = sponge_hash(item["msg2_hex"], item["bitlen2"], item["width"], item["rate"],
                               item["capacity"], item["start"], item["rounds"], item["output_bits"], window_mode=wmode)
        if (item["bitlen1"], eff1) == (item["bitlen2"], eff2):
            raise ValueError(f"Identical messages in {item['id']}")
        if d1 != d2 or d1 != item["digest_hex"]:
            raise ValueError(f"Digest mismatch in {item['id']}: {d1} vs {d2} (expected {item['digest_hex']})")
        print(f"[OK] {item['label']}\n     Shared digest: {d1}")
    for item in manifest["preimages"]:
        wmode = item.get("window_mode", "nominal")
        _, d = sponge_hash(item["msg_hex"], item["bitlen"], item["width"], item["rate"],
                           item["capacity"], item["start"], item["rounds"], item["output_bits"], window_mode=wmode)
        if d != item["target_digest_hex"]:
            raise ValueError(f"Preimage mismatch in {item['id']}: {d} != {item['target_digest_hex']}")
        print(f"[OK] {item['label']}\n     Matched target: {d}")
    print(f"ALL {len(manifest['collisions']) + len(manifest['preimages'])} KECCAK WITNESSES VERIFIED.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("campaign_witnesses.json")
    verify_all(target)
