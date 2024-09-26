import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { WalletProvider } from './context/WalletContext';
import BuyTokens from './components/BuyTokens';
import Connection from './components/Connection';






function App() {


  return (
    <WalletProvider>
      <div className="App">
        <Connection />

        <BuyTokens />


      </div>
    </WalletProvider>
  );
}

export default App;
