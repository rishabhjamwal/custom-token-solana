const bs58 = require("bs58")
const { Keypair, } = require("@solana/web3.js");

// const newK = Keypair.generate()
// console.log(newK);

const _privateKey = bs58.encode([
  19, 125, 192, 133, 54, 249, 27, 196, 254, 250, 50, 39, 29, 18, 171, 217, 230,
  63, 164, 181, 65, 61, 157, 1, 76, 172, 233, 207, 48, 142, 197, 35, 56, 61,
  210, 67, 208, 250, 171, 179, 215, 214, 96, 14, 225, 238, 216, 225, 218, 53,
  90, 249, 251, 154, 181, 151, 161, 33, 174, 173, 4, 138, 145, 146,
]);
console.log("****", _privateKey);


const secretKey = bs58.decode(_privateKey);
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
const address = new PublicKey(keypair.publicKey.toBase58());

console.log(address)


