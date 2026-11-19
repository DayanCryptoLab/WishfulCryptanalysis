#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <cstring>
#include <cstdlib>
#include "Keccak.h"
#include "KeccakCrunchyContest.h"

using namespace std;

// Forward declarations from KeccakCrunchyContest.cpp
int verifyPreimageChallenge(int r, int c, int nr, const UINT8 image[], int start, const UINT8 preimage[], const int preimageLength);
int verifyCollisionChallenge(int r, int c, int nr, int start, const UINT8 input1[], const int input1Length, const UINT8 input2[], const int input2Length);

class StateCheckingKeccak : public ReducedRoundKeccak {
public:
    using ReducedRoundKeccak::ReducedRoundKeccak;

    vector<UINT8> paddedState(const vector<UINT8>& message, int bitLength) {
        absorb(message, bitLength);
        flushAndSwitchToSqueezingPhase();
        const auto* first = state.get();
        return vector<UINT8>(first, first + (f->getWidth() + 7) / 8);
    }
};

static vector<UINT8> hexToBytes(const string& hexStr) {
    vector<UINT8> out;
    string clean;
    for (char ch : hexStr) {
        if ((ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F'))
            clean.push_back(ch);
    }
    if (clean.size() % 2 != 0) {
        cerr << "Error: odd hex string length (" << clean.size() << ")" << endl;
        exit(2);
    }
    for (size_t i = 0; i < clean.size(); i += 2) {
        unsigned int byte = stoul(clean.substr(i, 2), nullptr, 16);
        out.push_back((UINT8)byte);
    }
    return out;
}

static void printHex(const UINT8* buf, size_t len) {
    for (size_t i = 0; i < len; i++) {
        cout << hex << setw(2) << setfill('0') << (int)buf[i];
    }
    cout << dec << endl;
}

static bool messagesIdenticalBits(const vector<UINT8>& m1, int len1, const vector<UINT8>& m2, int len2) {
    if (len1 != len2) return false;
    int fullBytes = len1 / 8;
    for (int i = 0; i < fullBytes; i++) {
        if (m1[i] != m2[i]) return false;
    }
    int remBits = len1 % 8;
    if (remBits > 0) {
        UINT8 mask = (1u << remBits) - 1u;
        if ((m1[fullBytes] & mask) != (m2[fullBytes] & mask)) return false;
    }
    return true;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Usage:\n"
             << "  " << argv[0] << " selftest\n"
             << "  " << argv[0] << " hash <r> <c> <nr> <start> <msg_hex> <bitlen> [out_bits=160]\n"
             << "  " << argv[0] << " preimage <r> <c> <nr> <start> <target80_hex> <msg_hex> <bitlen>\n"
             << "  " << argv[0] << " collision <r> <c> <nr> <start> <msg1_hex> <bitlen1> <msg2_hex> <bitlen2> [--full-state]\n"
             << "  " << argv[0] << " raw-state-1600 <start> <nr> <state_hex>\n";
        return 2;
    }

    string cmd = argv[1];
    if (cmd == "selftest") {
        verifyChallenges();
        // Also verify Stefan Koelbl's 2026-10-31 5-round w=400 collision (89 bytes = 178 hex chars)
        auto m1 = hexToBytes("292e9afc912a1ca1a8120275ef277ff547a6502f48e4d83d7575cf0d30e148edb39f2207a6d7b63560d3c5b4c36d94b0fda01854277af67db12aee600000000000000000000000000000000000000000000000000000000000");
        auto m2 = hexToBytes("292e9afc912a1ca1a8120275ef277ff547a6502f48e4d83d7575cf0d30e11ec5787b62a4acca0c23e40dfb567d6a243537559208a75db4ddb82274810018401840184080008008000000082000000020800080020004000284");
        int ok = verifyCollisionChallenge(240, 160, 5, 0, m1.data(), 712, m2.data(), 712);
        return ok ? 0 : 1;
    } else if (cmd == "hash") {
        if (argc < 8) return 2;
        int r = stoi(argv[2]), c = stoi(argv[3]), nr = stoi(argv[4]), start = stoi(argv[5]);
        auto msg = hexToBytes(argv[6]);
        int bitlen = stoi(argv[7]);
        int outBits = (argc >= 9) ? stoi(argv[8]) : 160;
        if ((int)msg.size() * 8 < bitlen) {
            cerr << "Error: msg_hex shorter than bitlen" << endl;
            return 2;
        }
        vector<UINT8> out((outBits + 7) / 8, 0);
        ReducedRoundKeccak k(r, c, start, nr);
        if (bitlen > 0) k.absorb(msg.data(), bitlen);
        k.squeeze(out.data(), outBits);
        printHex(out.data(), out.size());
        return 0;
    } else if (cmd == "preimage") {
        if (argc < 9) return 2;
        int r = stoi(argv[2]), c = stoi(argv[3]), nr = stoi(argv[4]), start = stoi(argv[5]);
        auto target = hexToBytes(argv[6]);
        auto msg = hexToBytes(argv[7]);
        int bitlen = stoi(argv[8]);
        if (target.size() != 10) {
            cerr << "Error: preimage target must be 10 bytes (80 bits)" << endl;
            return 2;
        }
        if ((int)msg.size() * 8 < bitlen) {
            cerr << "Error: msg_hex shorter than bitlen" << endl;
            return 2;
        }
        int ok = verifyPreimageChallenge(r, c, nr, target.data(), start, msg.data(), bitlen);
        return ok ? 0 : 1;
    } else if (cmd == "raw-state-1600") {
        if (argc != 5) return 2;
        int start = stoi(argv[2]), nr = stoi(argv[3]);
        auto state = hexToBytes(argv[4]);
        if (start < 0 || start >= 255 || nr <= 0 || nr > 24 || state.size() != 200) {
            cerr << "Error: expected start in [0, 254], nr in [1, 24], and a 200-byte state" << endl;
            return 2;
        }
        KeccakFanyRounds permutation(1600, start, nr);
        permutation(state.data());
        printHex(state.data(), 10);
        return 0;
    } else if (cmd == "collision") {
        if (argc != 10 && (argc != 11 || string(argv[10]) != "--full-state")) return 2;
        int r = stoi(argv[2]), c = stoi(argv[3]), nr = stoi(argv[4]), start = stoi(argv[5]);
        auto m1 = hexToBytes(argv[6]);
        int len1 = stoi(argv[7]);
        auto m2 = hexToBytes(argv[8]);
        int len2 = stoi(argv[9]);
        if ((int)m1.size() * 8 < len1 || (int)m2.size() * 8 < len2) {
            cerr << "Error: msg_hex shorter than bitlen" << endl;
            return 2;
        }
        if (messagesIdenticalBits(m1, len1, m2, len2)) {
            cerr << "Error: the two input messages are identical!" << endl;
            return 1;
        }
        if (argc == 11) {
            StateCheckingKeccak first(r, c, start, nr), second(r, c, start, nr);
            if (first.paddedState(m1, len1) != second.paddedState(m2, len2)) {
                cerr << "Error: the padded sponge states differ" << endl;
                return 1;
            }
            cout << "Full-state collision (" << r + c << " bits): OK!" << endl;
        }
        int ok = verifyCollisionChallenge(r, c, nr, start, m1.data(), len1, m2.data(), len2);
        if (ok) {
            UINT8 out[20];
            ReducedRoundKeccak k(r, c, start, nr);
            if (len1 > 0) k.absorb(m1.data(), len1);
            k.squeeze(out, 160);
            cout << "Digest (160-bit): ";
            printHex(out, 20);
        }
        return ok ? 0 : 1;
    }
    cerr << "Unknown command: " << cmd << endl;
    return 2;
}
