import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Đọc keypair từ file
 * @param filename Tên file keypair
 * @returns Keypair đã đọc
 */
export function loadKeypairFromFile(filename: string): Keypair {
  try {
    const keypairDir = path.join(process.cwd(), "keypairs");
    const filePath = path.join(keypairDir, filename);

    // Đọc file
    const keypairData = fs.readFileSync(filePath);

    try {
      // Thử parse dữ liệu JSON (định dạng của script TypeScript)
      const secretKey = Uint8Array.from(JSON.parse(keypairData.toString()));
      return Keypair.fromSecretKey(secretKey);
    } catch (jsonError) {
      // Nếu không phải JSON, thử đọc dưới dạng binary (định dạng của solana-keygen)
      try {
        return Keypair.fromSecretKey(keypairData);
      } catch (binaryError) {
        console.error(
          "Không thể đọc keypair từ file. Định dạng không được hỗ trợ."
        );
        throw binaryError;
      }
    }
  } catch (error) {
    console.error(`Lỗi khi đọc keypair từ file ${filename}:`, error);
    throw error;
  }
}

/**
 * Kiểm tra xem file keypair có tồn tại không
 * @param filename Tên file keypair
 * @returns true nếu file tồn tại, false nếu không
 */
export function keypairFileExists(filename: string): boolean {
  const keypairDir = path.join(process.cwd(), "keypairs");
  const filePath = path.join(keypairDir, filename);
  return fs.existsSync(filePath);
}

/**
 * Lấy địa chỉ công khai từ file keypair
 * @param filename Tên file keypair
 * @returns Địa chỉ công khai dưới dạng string
 */
export function getPublicKeyFromFile(filename: string): string {
  const keypair = loadKeypairFromFile(filename);
  return keypair.publicKey.toString();
}

//TODO: load private key from file
export function getPrivateKeyFromFile(filename: string): string {
  const keypair = loadKeypairFromFile(filename);
  return Buffer.from(keypair.secretKey).toString("base64");
}
