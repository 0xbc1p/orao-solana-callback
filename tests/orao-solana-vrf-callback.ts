import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { OraoSolanaVrfCallback } from "../target/types/orao_solana_vrf_callback";

describe("orao-solana-vrf-callback", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.oraoSolanaVrfCallback as Program<OraoSolanaVrfCallback>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
