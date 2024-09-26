import React from 'react';
import { useWallet } from '../context/WalletContext'

function Connection() {
  const { currentAccount, connectWithMetamask } = useWallet();

  return (
    <div className="">
      {currentAccount ? 
        <p>Connected Account: {currentAccount}</p> : 
        <button onClick={connectWithMetamask}>Connect To Wallet</button>
      }
    </div>
  );
}

export default Connection;
