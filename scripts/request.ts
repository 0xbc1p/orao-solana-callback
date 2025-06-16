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
    NetworkState,
    OraoCb,
    requestAccountAddress
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

    const [clientSatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("CLIENT_STATE")],
      exampleClient.programId
    );

    const [clientAddr] = clientAddress(
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

    let seed = nacl.randomBytes(32);

    let requestAddr = requestAccountAddress(clientAddr, seed)[0];

    const tx = await exampleClient.methods
      .request([...seed], null)
      .accounts({
        //@ts-ignore
        vrf: vrf.programId,
        clientState: clientSatePda,
        client: clientAddr,
        networkState: NetworkState.createAddress(networkState.bump)[0],
        treasury: networkState.config.treasury,
        request: requestAddr,
      })
      .rpc();

    console.log("request success tx:", tx);

    let fulfilled = await vrf.waitFulfilled(clientAddr, seed, "regular");

    console.log("Fulfilled:", fulfilled.state.randomness);


  } catch (error) {
    console.error("error deploy:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
