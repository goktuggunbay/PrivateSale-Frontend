import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SaleTokenABI from "../abi/SaleToken.json";
import PrivateSaleABI from "../abi/PrivateSale.json";
import PaymentTokenABI from "../abi/PaymentToken.json";

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isWhitelisted, setIsWhitelisted] = useState("");


  // Dosya boyutu büyük olmaması adına ve test ortamında değişikliklerin hızlı geçirilebilmesi için
  // adresleri değişken içinde tuttum.
 
  const PrivateSaleAddress = "0xe0294b767f39D53997a9F14C468Aa5c87fd92D61";
  const PaymentTokenAddress = "0xA9384A1Ca855a9b6335dC299ba3A382412aAA88f";
  const SaleTokenAddress = "0xf23001672B13718E04fDeaa31E6a5edCb9cA0e2a";

  const [privateSaleContract, setPrivateSaleContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [saleTokenContract, setSaleTokenContract] = useState(null);

  // Hesap değişimi durumunda kontrol yapıyoruz
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      console.log("Please connect to MetaMask.");
      setCurrentAccount("");
    } else if (accounts[0] !== currentAccount) {
      setCurrentAccount(accounts[0]);
    }
  };

  // MetaMask bağlantısı
  const connectWithMetamask = async () => {
    if (!window.ethereum) {
      console.log("MetaMask is not installed!");
      return;
    }

    const conProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(conProvider);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);

      const signerFromProvider = await conProvider.getSigner();
      setSigner(signerFromProvider);
    } catch (error) {
      console.log("Error connecting to MetaMask:", error);
    }
  };

  // Signer değiştiğinde kontratları oluşturduğumuz bölüm
  useEffect(() => {
    if (signer) {
      const privateSaleContractInstance = new ethers.Contract(PrivateSaleAddress, PrivateSaleABI, signer);
      const usdtContractInstance = new ethers.Contract(PaymentTokenAddress, PaymentTokenABI, signer);
      const saleTokenContractInstance = new ethers.Contract(SaleTokenAddress, SaleTokenABI, signer);

      setPrivateSaleContract(privateSaleContractInstance);
      setUsdtContract(usdtContractInstance);
      setSaleTokenContract(saleTokenContractInstance);
    }
  }, [signer]);

  // currentAccount her değiştiğinde whitelist durumunu kontrol ettiğmiz bölüm
  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (privateSaleContract && currentAccount) {
        try {
          const checkWL = await privateSaleContract.wlAddress(currentAccount);
          setIsWhitelisted(checkWL);
        } catch (error) {
          console.log("Error checking whitelist status:", error);
        }
      }
    };
    checkWhitelistStatus();
  }, [currentAccount, privateSaleContract]);

  // MetaMask hesap değişimi dinleyicisi
  useEffect(() => {
    if (provider) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (provider) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [provider]);

  return ( //context değerleri
    <WalletContext.Provider value={{
      provider, signer, currentAccount, connectWithMetamask,
      PaymentTokenAddress, PrivateSaleAddress, SaleTokenAddress,
      privateSaleContract, saleTokenContract, usdtContract, isWhitelisted
    }}>
      {children}
    </WalletContext.Provider>
  );
};
