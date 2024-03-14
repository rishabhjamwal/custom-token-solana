const {
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const {
  AccountLayout,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  createMint,
  getMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  closeAccount,
  transfer,
} = require("../spl-token");
const bs58 = require("bs58");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// wallet info
const privateKey =
  "PbvZmf7iXDCFUDmMZBb9aqFZCPkDXudBJqzrMPF51HFVrfayAuoDCsjy9S2C1KBxQBQ47a1sw3VRKtKRACG7Wiu";
const secretKey = bs58.decode(privateKey);
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

const fromTokenAccount = new PublicKey(
  "C39VzD552zvZi2fzYs1H2Vzj3AzpGYKNVqn3yApracvV"
);
const toTokenAccount = new PublicKey(
  "4p58QjCQcyuyM9bscYXBMHrDsMJxrZuccSd5CB6fdN7y"
);

// common variables
const mintAddress = "FKCdZioTrgSqb7ug7HprDWoSMHg3ZyjGV2nL67LBPhBz";
const tokenAccountAddress = "C39VzD552zvZi2fzYs1H2Vzj3AzpGYKNVqn3yApracvV";

/**
 *
 * Utility Functions
 *
 * */

const fetchBalances = async () => {
  const address = new PublicKey(keypair.publicKey.toBase58());
  const balance = await connection.getBalance(address);
  const balanceInSol = balance / LAMPORTS_PER_SOL;
  console.log(
    `The balance of the account at ${address} is ${balanceInSol} SOL`
  );
};

const airdrop = async () => {
  const airdropSignature = await connection.requestAirdrop(
    keypair.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  console.log("airdropSignature", airdropSignature);

  const airdropTxConfirmation = await connection.confirmTransaction({
    signature: airdropSignature,
  });
  console.log("airdropTxConfirmation", airdropTxConfirmation);
};

const createToken = async () => {
  const mint = await createMint(
    connection,
    keypair,
    keypair.publicKey,
    keypair.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  );

  console.log(mint.toBase58());
};

const tokenInfo = async () => {
  const mint = new PublicKey(mintAddress);
  const mintInfo = await getMint(connection, mint);
  console.log("mintInfo", mintInfo);
  const supply = Number(mintInfo.supply);
  console.log("supply-", supply);
};

const getOrCreateTokenAccount = async () => {
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new PublicKey(mintAddress),
    keypair.publicKey
  );

  console.log(tokenAccount.address.toBase58());
};

const tokenAccountInfo = async () => {
  const tokenAccount = new PublicKey(tokenAccountAddress);
  const tokenAccountInfo = await getAccount(connection, tokenAccount);
  console.log("tokenAccountInfo", tokenAccountInfo);
};

const mintToAccount = async () => {
  const mint = new PublicKey(mintAddress);
  const tokenAccount = new PublicKey(tokenAccountAddress);

  await mintTo(
    connection,
    keypair,
    mint,
    tokenAccount,
    keypair.publicKey,
    100 * LAMPORTS_PER_SOL // because decimals for the mint are set to 9
  );
};

const viewAllTokensOfKeypair = async () => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    keypair.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  console.log("Token                                         Balance");
  console.log("------------------------------------------------------------");
  tokenAccounts.value.forEach((tokenAccount) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    console.log(
      `${new PublicKey(accountData.mint)}   ${
        Number(accountData.amount) / LAMPORTS_PER_SOL
      }`
    );
  });
};

const wrapSol = async () => {
  console.log("Native sol program id: ", NATIVE_MINT);
  const associatedTokenAccount = await getAssociatedTokenAddress(
    NATIVE_MINT,
    keypair.publicKey
  );
  console.log("associatedTokenAccount", associatedTokenAccount);

  // Create token account to hold our wrapped SOL
  const ataTransaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      keypair.publicKey,
      associatedTokenAccount,
      keypair.publicKey,
      NATIVE_MINT
    )
  );

  const ataTransactionreceipt = await sendAndConfirmTransaction(
    connection,
    ataTransaction,
    [keypair]
  );

  console.log("ataTransactionreceipt", ataTransactionreceipt);

  // Transfer SOL to associated token account and use SyncNative to update wrapped SOL balance
  const solTransferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: associatedTokenAccount,
      lamports: LAMPORTS_PER_SOL,
    }),
    createSyncNativeInstruction(associatedTokenAccount)
  );

  const solTransferTxReceipt = await sendAndConfirmTransaction(
    connection,
    solTransferTransaction,
    [keypair]
  );

  console.log("solTransferTxReceipt", solTransferTxReceipt);
};

const unwrapSol = async () => {
  const associatedTokenAccount = await getAssociatedTokenAddress(
    NATIVE_MINT,
    keypair.publicKey
  );
  console.log("associatedTokenAccount", associatedTokenAccount);

  const accountInfo = await getAccount(connection, associatedTokenAccount);
  console.log("accountInfo", accountInfo);
  console.log(
    `Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`
  );

  const walletBalance = await connection.getBalance(keypair.publicKey);
  console.log(`Balance before unwrapping 1 WSOL: ${walletBalance}`);

  await closeAccount(
    connection,
    keypair,
    associatedTokenAccount,
    keypair.publicKey,
    keypair
  );

  const walletBalancePostClose = await connection.getBalance(keypair.publicKey);

  console.log(`Balance after unwrapping 1 WSOL: ${walletBalancePostClose}`);
};

const transferTokens = async () => {
  signature = await transfer(
    connection,
    keypair,
    fromTokenAccount,
    toTokenAccount,
    keypair.publicKey,
    LAMPORTS_PER_SOL - 50
  );
};

module.exports = {
  fetchBalances,
  airdrop,
  createToken,
  tokenInfo,
  getOrCreateTokenAccount,
  tokenAccountInfo,
  mintToAccount,
  viewAllTokensOfKeypair,
  wrapSol,
  unwrapSol,
  transferTokens,
};
