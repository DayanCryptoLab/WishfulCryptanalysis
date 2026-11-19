"""Verify full and partial Keccak message matches and raw permutation states."""

import argparse
import json
from pathlib import Path
import subprocess


def run_verifier(verifier, arguments):
    return subprocess.run(
        [verifier, *map(str, arguments)], capture_output=True, text=True, timeout=10
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("verifier", type=Path, help="path to the compiled verify_crunchy binary")
    verifier = str(parser.parse_args().verifier.resolve())
    results = json.loads(Path(__file__).with_name("results.json").read_text(encoding="utf-8"))
    failures = 0

    for case in results["preimages"]:
        arguments = [
            "preimage",
            case["rate"],
            case["capacity"],
            case["rounds"],
            case["start_round"],
            case["target_digest_hex"],
            case["message_hex"],
            case["message_bit_length"],
        ]
        result = run_verifier(verifier, arguments)
        passed = result.returncode == 0 and "OK!" in result.stdout
        failures += not passed
        print(f"{'PASS' if passed else 'FAIL'} {case['id']}: {result.stdout.strip()}")
        if result.stderr:
            print(result.stderr.strip())

    states = results["raw_state_samples"]
    for sample in states["samples"]:
        state = b"".join(int(lane, 16).to_bytes(8, "little") for lane in sample["lanes_hex"])
        arguments = ["raw-state-1600", states["start_round"], states["rounds"], state.hex()]
        result = run_verifier(verifier, arguments)
        digest = result.stdout.strip()
        passed = result.returncode == 0 and digest == states["target_digest_hex"]
        failures += not passed
        print(f"{'PASS' if passed else 'FAIL'} {sample['id']}: {digest}")
        if result.stderr:
            print(result.stderr.strip())

    partials = results["partial_matches"]
    target = bytes.fromhex(partials["target_digest_hex"])
    for sample in partials["samples"]:
        result = run_verifier(verifier, [
            "hash", partials["rate"], partials["capacity"], partials["rounds"],
            partials["start_round"], sample["message_hex"], partials["message_bit_length"], 80,
        ])
        digest = result.stdout.strip()
        if result.returncode != 0 or digest != sample["digest_hex"]:
            failures += 1
            print(f"FAIL {sample['id']}: {result.stderr.strip() or digest}")
            continue

        # The lowest-index differing bit ends the prefix in Keccak's bit order.
        actual = bytes.fromhex(digest)
        difference = int.from_bytes(actual, "little") ^ int.from_bytes(target, "little")
        leading = (difference & -difference).bit_length() - 1 if difference else 80
        total = 80 - bin(difference).count("1")
        passed = (
            difference != 0
            and leading == sample["leading_matching_bits"]
            and total == sample["total_matching_bits"]
        )
        failures += not passed
        print(f"{'PASS' if passed else 'FAIL'} {sample['id']}: {leading} leading, {total}/80 total")

    return int(failures > 0)


if __name__ == "__main__":
    raise SystemExit(main())
