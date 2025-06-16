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
import { OraoCb, RegisterBuilder } from "@orao-network/solana-vrf-cb";

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

    const [clientPda, clientStateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("CLIENT_STATE")],
      exampleClient.programId
    );

    const [additionalAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ADDITIONAL_ACCOUNT")],
      exampleClient.programId
    );
    console.log("State PDA:", clientPda.toString());
    console.log("Additional Account PDA:", additionalAccountPda.toString());

    let builder = await new RegisterBuilder(
      vrf,
      exampleClient.programId, // the program we are registering
      clientPda, // the state PDA we are using for registration
      // the state PDA seeds
      [Buffer.from("CLIENT_STATE"), Buffer.from([clientStateBump])]
    ).build();

    let tx = await builder.rpc();
    console.log("Registered in", tx);
  } catch (error) {
    console.error("error deploy:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
