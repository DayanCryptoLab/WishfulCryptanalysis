# WishfulCryptanalysis

This repository archives practical results and offline verification code for reduced-round cryptography experiments. Each project lists its tested configurations, recorded results, and verification commands.

| Project | Practical results |
| --- | --- |
| [cryptAnalysisAgent](cryptAnalysisAgent/) | Paper case studies for Keccak collisions and AES-MMO collisions |
| [hash-challenge-Preimage](hash-challenge-Preimage/) | Keccak preimage witnesses and archived intermediate-state measurements |
| [hash-challenge](hash-challenge/) | Keccak collision witnesses and the shared Keccak verifier |
| [aes-challenge](aes-challenge/) | AES-DM and AES-MMO collision vectors and an AES reference check |

The Python verification commands use the standard library. The Keccak challenge verifier also needs a C++17 compiler. Check each project's round window and input conventions before comparing results.
