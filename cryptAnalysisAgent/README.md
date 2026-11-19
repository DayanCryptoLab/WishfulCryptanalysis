# cryptAnalysisAgent paper artifacts

These are the fixed witnesses accompanying the *Wishful Cryptanalysis* paper appendix. The Keccak bundle contains seven collisions and two preimages on reduced-round Keccak Crunchy Contest instances. The 3-round preimage uses the extended LFSR window 93–95. The AES bundle contains 6- and 7-round semi-free-start collisions and a 4-round fixed-IV collision for reduced-round AES-128-MMO.

Run from the repository root with Python 3 and its standard library.

```sh
python3 -E -B cryptAnalysisAgent/paper/case-studies/keccak-6r/verify_campaign_witnesses.py
python3 -E -B cryptAnalysisAgent/paper/case-studies/keccak-6r/verify_witness.py
python3 -E -B cryptAnalysisAgent/paper/case-studies/aes-mmo/verify_aes_witnesses.py
```

The [Keccak campaign manifest](paper/case-studies/keccak-6r/campaign_witnesses.json) gives the round parameters, messages, and digests. The separate [width-800 witness](paper/case-studies/keccak-6r/witness.json) is the campaign's first collision and has a dedicated checker. The three [AES paper witnesses](paper/case-studies/aes-mmo/witnesses.json) are rows 2A-1, 2A-2, and 2B-1 of the [full AES challenge suite](../aes-challenge/README.md).

All seven Keccak collisions also appear in the [collision challenge results](../hash-challenge/collision_witnesses.json). The two paper preimages also appear in the [preimage challenge results](../hash-challenge-Preimage/results.json).

The checkers recompute the recorded digest matches. The Keccak campaign checker verifies the recorded squeeze output for each collision, including entries described in the paper as full-state collisions. Timing and novelty labels come from the source reports. Run Python with its default assertion settings.
