import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Tạo keypair ngẫu nhiên và lưu vào file
 * @param filename Tên file để lưu keypair
 * @returns Keypair đã tạo
 */
function generateAndSaveKeypair(filename: string): Keypair {
  // Tạo keypair ngẫu nhiên
  const keypair = Keypair.generate();

  // Lấy đường dẫn thư mục keypairs
  const keypairDir = path.join(process.cwd(), "keypairs");

  // Đảm bảo thư mục tồn tại
  if (!fs.existsSync(keypairDir)) {
    fs.mkdirSync(keypairDir, { recursive: true });
  }

  // Lấy đường dẫn đầy đủ của file
  const filePath = path.join(keypairDir, filename);

  // Lưu secret key vào file dưới dạng JSON
  fs.writeFileSync(filePath, JSON.stringify(Array.from(keypair.secretKey)));

  console.log(`Đã lưu keypair vào file: ${filePath}`);
  console.log(`Địa chỉ công khai: ${keypair.publicKey.toString()}`);

  return keypair;
}

/**
 * Hàm chính để tạo các keypair cần thiết
 */
function main() {
  console.log("Đang tạo keypair cho deployer...");
  const deployerKeypair = generateAndSaveKeypair("deployer-keypair.json");
  const userKeypair = generateAndSaveKeypair("user-keypair.json");

  const deployerAddress = deployerKeypair.publicKey.toString();
  const deployerPrivateKey = Buffer.from(deployerKeypair.secretKey).toString(
    "base64"
  );
  console.log(`Địa chỉ deployer: ${deployerAddress}`);
  console.log(`Private key deployer: ${deployerPrivateKey}`);

  const userAddress = userKeypair.publicKey.toString();
  const userPrivateKey = Buffer.from(userKeypair.secretKey).toString("base64");
  console.log(`Địa chỉ user: ${userAddress}`);
  console.log(`Private key user: ${userPrivateKey}`);
}

// Chạy hàm main
main();
