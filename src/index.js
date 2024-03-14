const {
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
  transferTokens
} = require("./utility");

async function main() {
  // await airdrop();
  // await fetchBalances();
  // ***Creating my own fungible token also called mint account***
  await createToken();
  // ***getting mint account info***
  // await tokenInfo();
  // ***creating my token account***
  // await getOrCreateTokenAccount();
  // ***getting token account info***
  // await tokenAccountInfo();
  // ***minting new token to the keypair for mint account***
  // await mintToAccount();
  // ***view all tokens owned by the keypair***
  // await viewAllTokensOfKeypair();
  // ***wrapping sol in a token***
  // await wrapSol();
  // ***unwrap sol***
  // await unwrapSol();
  // ***Transfer Tokens***
  // await transferTokens();
}

main();
