"""Recompute the preserved Keccak-f[800] six-round collision using Python only.

This checker supports this exact single-block challenge configuration.
Run: python3 verify_witness.py [witness.json]
"""
import json
import struct
import sys
from pathlib import Path

ROTATIONS = [
    [0, 36, 3, 41, 18], [1, 44, 10, 45, 2], [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56], [27, 20, 39, 8, 14],
]
CONSTANTS = [0x00008089, 0x00008003, 0x00008002, 0x00000080, 0x0000800A, 0x8000000A]
MASK = (1 << 32) - 1


def rotate(value, shift):
    shift %= 32
    return ((value << shift) | (value >> ((32 - shift) % 32))) & MASK


def digest(message_hex, bit_length):
    if bit_length != 638:
        raise ValueError('This checker supports exactly 638-bit single-block messages.')
    raw = bytearray.fromhex(message_hex)
    if len(raw) != 80:
        raise ValueError('The witness must supply 80 bytes for its 638-bit message.')
    raw[-1] = (raw[-1] & 0x3F) | 0xC0
    lanes = list(struct.unpack('<20I', raw)) + [0] * 5
    state = [[lanes[x + 5 * y] for y in range(5)] for x in range(5)]
    for rc in CONSTANTS:
        parity = [state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4]
                  for x in range(5)]
        theta = [parity[(x - 1) % 5] ^ rotate(parity[(x + 1) % 5], 1) for x in range(5)]
        linear = [[0] * 5 for _ in range(5)]
        for x in range(5):
            for y in range(5):
                linear[y][(2 * x + 3 * y) % 5] = rotate(state[x][y] ^ theta[x], ROTATIONS[x][y])
        state = [[linear[x][y] ^ ((~linear[(x + 1) % 5][y] & MASK) & linear[(x + 2) % 5][y])
                  for y in range(5)] for x in range(5)]
        state[0][0] ^= rc
    return struct.pack('<5I', *(state[x][0] for x in range(5))).hex()


def verify(path):
    data = json.loads(path.read_text())
    expected = {'rate': 640, 'capacity': 160, 'rounds': 6, 'start': 14, 'output_bits': 160}
    if any(data.get(k) != value for k, value in expected.items()):
        raise ValueError('The witness parameters do not match this checker.')
    first = digest(data['msg1_hex'], data['bitlen1'])
    second = digest(data['msg2_hex'], data['bitlen2'])
    first_message = int.from_bytes(bytes.fromhex(data['msg1_hex']), 'little') & ((1 << 638) - 1)
    second_message = int.from_bytes(bytes.fromhex(data['msg2_hex']), 'little') & ((1 << 638) - 1)
    if first_message == second_message:
        raise ValueError('The effective 638-bit input messages are identical.')
    if first != second or first != data['digest1_hex'] or second != data['digest2_hex']:
        raise ValueError('Collision verification failed.')
    print('Digest(M1):', first)
    print('Digest(M2):', second)
    print('VERIFIED: distinct 638-bit messages, complete 160-bit six-round collision.')


if __name__ == '__main__':
    verify(Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name('witness.json'))
