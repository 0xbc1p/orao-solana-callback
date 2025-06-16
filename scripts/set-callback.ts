import * as anchor from "@coral-xyz/anchor";
import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";

import { Connection, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

import {
  clientAddress,
  OraoCb,
  requestAccountAddress,
} from "@orao-network/solana-vrf-cb";
import ExampleClientIdl from "../target/idl/example_client.json";
import { ExampleClient } from "../target/types/example_client";
import { loadKeypairFromFile } from "./helpers/load-keypair";

const DEPLOYER_KEYPAIR_FILE = "deployer-keypair.json";

async function main() {
  try {
    const deployerKeypair = loadKeypairFromFile(DEPLOYER_KEYPAIR_FILE);

    console.log("Deployer address:", deployerKeypair.publicKey.toString());

    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    const provider = new AnchorProvider(
      connection,
      new Wallet(deployerKeypair),
      {
        commitment: "confirmed",
      }
    );

    setProvider(provider);

    const exampleClient = new Program<ExampleClient>(
      ExampleClientIdl,
      provider
    );

    let vrf = new OraoCb(exampleClient.provider);

    const [clientSatePda, clientStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("CLIENT_STATE")],
      exampleClient.programId
    );

    const [clientAddr, clientBump] = clientAddress(
      exampleClient.programId,
      clientSatePda
    );

    const [additionalAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ADDITIONAL_ACCOUNT")],
      exampleClient.programId
    );
    console.log("client Sate PDA:", clientSatePda.toString());
    console.log("Additional Account PDA:", additionalAccountPda.toString());
    console.log("client PDA:", clientAddr.toString());

    let networkState = await vrf.getNetworkState();
    console.log("networkState:", networkState);

    let ixCode = new anchor.BorshInstructionCoder(exampleClient.idl);
    let tx = await vrf.methods
      .setCallback({
        newCallback: {
          remainingAccounts: [], // no remaining accounts in this test
          // borsh-encoded callback instruction data
          data: ixCode.encode("clientLevelCallback", {
            testParameter: 22,
          }),
        },
      })
      .accountsPartial({
        client: clientAddr,
      })
      .rpc();

    console.log("tx:", tx);
    
  } catch (error) {
    console.error("error deploy:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
