/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/umbra_program.json`.
 */
export type UmbraProgram = {
  "address": "Umbra11111111111111111111111111111111111111",
  "metadata": {
    "name": "umbraProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Solana Anchor Program for Umbra"
  },
  "instructions": [
    {
      "name": "sendStealth",
      "discriminator": [
        182,
        78,
        241,
        12,
        239,
        172,
        60,
        195
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "stealthPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  101,
                  97,
                  108,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "stealthPubkey"
              }
            ]
          }
        },
        {
          "name": "stealthPubkey"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "announcement"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sendStealthSpl",
      "discriminator": [
        167,
        45,
        163,
        104,
        114,
        79,
        11,
        189
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "docs": [
            "The mint of the token."
          ]
        },
        {
          "name": "senderTokenAccount",
          "docs": [
            "The sender's token account."
          ],
          "writable": true
        },
        {
          "name": "stealthPda",
          "docs": [
            "The stealth PDA defined as before."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  101,
                  97,
                  108,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "stealthPubkey"
              }
            ]
          }
        },
        {
          "name": "stealthTokenAccount",
          "docs": [
            "The Associated Token Account (ATA) for the stealth PDA.",
            "We should use `init_if_needed` but `anchor_spl::associated_token` is needed for that.",
            "If we removed anchor-spl, we can't usage `associated_token::*` constraints!",
            "We must Init manually via CPI if needed? Or rely on client to init?",
            "`init_if_needed` is complex without anchor-spl.",
            "Let's Assume it exists for now (Client inits).",
            "OR, we can use `associated_token::Create` via CPI.",
            "But wait, strictly speaking, just transferring to it requires it to exist."
          ],
          "writable": true
        },
        {
          "name": "stealthPubkey"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "announcement"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "stealthPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  101,
                  97,
                  108,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The owner of the stealth keypair (P)."
          ],
          "signer": true
        },
        {
          "name": "recipient",
          "docs": [
            "The recipient of the funds."
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawWithRelayer",
      "discriminator": [
        80,
        91,
        252,
        165,
        89,
        9,
        77,
        238
      ],
      "accounts": [
        {
          "name": "stealthPda",
          "writable": true
        },
        {
          "name": "relayer",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "instructions",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "stealthVault",
      "discriminator": [
        136,
        20,
        88,
        160,
        20,
        201,
        99,
        203
      ]
    }
  ],
  "events": [
    {
      "name": "stealthAnnouncement",
      "discriminator": [
        197,
        85,
        83,
        203,
        142,
        88,
        5,
        176
      ]
    }
  ],
  "types": [
    {
      "name": "announcement",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ephemeralPubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "hashedTag",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "ciphertext",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "stealthAnnouncement",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ephemeralPubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "hashedTag",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "ciphertext",
            "type": "bytes"
          },
          {
            "name": "tokenMint",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "stealthVault",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
