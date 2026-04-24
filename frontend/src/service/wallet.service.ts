import { BrowserProvider } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask não encontrada");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
    accounts,
  };
}

export async function getConnectedWallet() {
  if (!window.ethereum) {
    return null;
  }

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return null;
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  };
}