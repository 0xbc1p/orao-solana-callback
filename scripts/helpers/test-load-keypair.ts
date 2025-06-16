import { getPrivateKeyFromFile, getPublicKeyFromFile } from "./load-keypair";

// Đọc keypair từ file
const deployerPublicKey = getPublicKeyFromFile("deployer-keypair.json");
const userPublicKey = getPublicKeyFromFile("user-keypair.json");
const deployPrivateKey = getPrivateKeyFromFile("deployer-keypair.json");

console.log("Địa chỉ deployer:", deployerPublicKey);
console.log("Địa chỉ userPublicKey:", userPublicKey);
console.log("Private key deployer:", deployPrivateKey);
