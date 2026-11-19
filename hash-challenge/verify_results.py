#!/usr/bin/env python3
"""Check the recorded Keccak collision witnesses with the reference verifier."""

import argparse
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("verifier", type=Path, help="path to the compiled verify_crunchy binary")
    args = parser.parse_args()
    verifier = args.verifier.resolve()
    if not verifier.is_file():
        parser.error(f"verifier binary does not exist: {verifier}")

    fixtures = Path(__file__).with_name("collision_witnesses.json")
    witnesses = json.loads(fixtures.read_text(encoding="utf-8"))["collisions"]
    if not witnesses:
        raise SystemExit("No collision witnesses to verify")

    failures = 0
    for witness in witnesses:
        command = [
            str(verifier),
            "collision",
            str(witness["rate"]),
            str(witness["capacity"]),
            str(witness["rounds"]),
            str(witness["start"]),
            witness["msg1_hex"],
            str(witness["bitlen1"]),
            witness["msg2_hex"],
            str(witness["bitlen2"]),
        ]
        if witness.get("full_state"):
            command.append("--full-state")

        result = subprocess.run(command, capture_output=True, text=True, check=False)
        expected_digest = f"Digest (160-bit): {witness['digest_hex']}"
        if result.returncode or expected_digest not in result.stdout.splitlines():
            print(f"FAIL {witness['id']}")
            print((result.stderr or result.stdout).strip())
            failures += 1
            continue
        detail = " (full state verified)" if witness.get("full_state") else ""
        print(f"OK {witness['id']}{detail}")

    print(f"{len(witnesses) - failures}/{len(witnesses)} Keccak collision witnesses verified")
    return bool(failures)


if __name__ == "__main__":
    raise SystemExit(main())
