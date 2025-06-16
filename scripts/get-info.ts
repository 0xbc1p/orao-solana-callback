import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

import ExampleClientIdl from "../target/idl/example_client.json";
import { ExampleClient } from "../target/types/example_client";
import { loadKeypairFromFile } from "./helpers/load-keypair";
import { clientAddress } from "@orao-network/solana-vrf-cb";

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

    const [clientSatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("CLIENT_STATE")],
      exampleClient.programId
    );

    const [additionalAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ADDITIONAL_ACCOUNT")],
      exampleClient.programId
    );

    const [clientAddr, clientBump] = clientAddress(
      exampleClient.programId,
      clientSatePda
    );
    console.log("State PDA:", clientSatePda.toString());
    console.log("Additional Account PDA:", additionalAccountPda.toString());
    console.log("Client PDA:", clientAddr.toString());

    const clientState = await exampleClient.account.clientState.fetch(clientSatePda);
    console.log("clientState:", clientState);

    const additionalAccount = await exampleClient.account.additionalAccount.fetch(additionalAccountPda);
    console.log("additionalAccount:", additionalAccount);

    const clientAccount = await exampleClient.account.client.fetch(clientAddr);
    console.log("clientAccount:", clientAccount);
  } catch (error) {
    console.error("error deploy:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
