import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import PrivateSaleABI from "../abi/PrivateSale.json";
import PaymentTokenABI from "../abi/PaymentToken.json";

const BuyTokens = () => {
    const [inputValue, setInputValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const {   currentAccount,  PrivateSaleAddress, privateSaleContract, usdtContract,  isWhitelisted } = useWallet();

    const [readValues, setReadValues] = useState({
        wlCount: "",
        claimedCount: "",
        contractTokenBalance: "",
        contractPaymentBalance: "",
        upperLimit: "",
        oneTokenPrice:""

    });


    // Kontrat verilerini çektiğimiz bölüm

    const fetchReadValues = async () => {
        try {
            const values = await privateSaleContract.getReadValues();
            const oneTokenPrice = await privateSaleContract.oneTokenPrice();
            const upperLimit = await privateSaleContract.upperLimit();
            setReadValues({
                wlCount: values[0].toString(),
                claimedCount: values[1].toString(),
                contractTokenBalance: ethers.formatUnits(values[2], 18), 
                contractPaymentBalance: ethers.formatUnits(values[3], 6), 
                oneTokenPrice:oneTokenPrice.toString(),
                upperLimit:upperLimit.toString()
            });
        } catch (error) {
            console.error("Data could not be retrieved: ", error);
        }
    };

  
    // Approve işlemi
    const approveTokens = async () => {
        try {
        
            setLoading(true);

                                                     // etherjs v6 da değer değişimleri yaptığımız fonksiyonlarda tutarlı
                                                     //bir değer elde edemedim bu yüzden hesaplamasını el ile yaptım.
            const approveTx = await usdtContract.approve(PrivateSaleAddress, inputValue.toString()*1000000);
            await approveTx.wait();

            const allowance = await usdtContract.allowance(currentAccount, PrivateSaleAddress);
            console.log("Allowance: ", ethers.formatUnits(allowance, 6));
            console.log("The approve transaction was successfully completed.");
            setLoading(false);
            return true;
        } catch (error) {
            console.error("The approve transaction failed.Error:", error);
            alert("The approve transaction failed. Please try again.");
            setLoading(false);
            return false;
        }
    };


        // Buy token işlemi
    const handleBuyButton = async (event) => {
        event.preventDefault();
        if (inputValue <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
                                            
        try {
            const isApproved = await approveTokens(); // Approve başarılı olduktan sonra 
            if (isApproved) {                          // buy token fonksiyonu gerçekleştirilir
                const paymentAmountInWei = inputValue.toString() ; // buytokens işleminde bir değer değişikliği yapmaya gerek olmadığını fark
                                                                    //ettim direkt olarak değeri gönderdim.
                const status = await privateSaleContract.status(); // Status durumu kontrol edilir 

                if (status.toString() !== "1") {
                    console.log("Not Started yet.");        // Eğer durum status uygun değilse fonksiyon iptali gerçekleştirilir.
                    return;                                  //Whitelist kontrolünü en başta yaptığımız ve arkaplanda da kontrolü gerçekleştiği için eklemedim.               
                }

                setLoading(true);
                const buyTx = await privateSaleContract.buyTokens(paymentAmountInWei, { gasLimit: 500000 }); // Gas Limit eklenmeden hata mesajı döndürüyor 
                await buyTx.wait();
                console.log("The token purchase transaction was successfully completed!");
                alert("The token purchase transaction was successfully completed!");
               
                setLoading(false);
            }
        } catch (error) {
            console.error("The token purchase transaction failed. Error:", error);
            alert("The token purchase transaction failed.");
          
            setLoading(false);
        }
    };

// Claim işlemi

    const handleClaimButton = async (event) => {
        event.preventDefault();
        try {
            const status = await privateSaleContract.status();
            if (status.toString() !== "2") {
                console.log("Claim is not available yet."); // Claim işlemi başlatılmış mı kontrolünü yapıyoruz
                return;
            }

            setLoading(true);
            const tx = await privateSaleContract.claimTokens({ gasLimit: 500000 });
            await tx.wait();
            alert("Tokens claimed successfully!");
            setLoading(false);
        } catch (err) {
            console.error("An error occurred during the claim process:", err);
            setLoading(false);
        }
    };

 

    return (
        <>
            {currentAccount ? (
                <>
                    <h3 style={{ color: isWhitelisted ? 'green' : 'red', fontFamily: 'sans-serif' }}>
                        {isWhitelisted ? "You are in the whitelist" : "You are not in the whitelist"}
                    </h3>

                    <div style={{ width: '300px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label htmlFor="amount">USDT Amount</label>
                            <input
                                value={inputValue}
                                onChange={(event) => setInputValue(event.target.value)}
                                type="number"
                                placeholder='Amount'
                                disabled={loading}
                            />
                            <button onClick={handleBuyButton} disabled={loading}>
                                {loading ? 'Processing...' : 'Buy'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                            <button onClick={handleClaimButton} disabled={loading}>
                                {loading ? 'Processing...' : 'Claim Token'}
                            </button>
                        </div>

                      

                      
                    </div>

                    <div>
                        <h2>Contract Data</h2>
                        <button onClick={fetchReadValues} disabled={loading}>
                            {loading ? 'Processing...' : 'Read PrivateSale Values'}
                        </button>

                        <p>Whitelist Adresses Count: {readValues.wlCount}</p>
                        <p>Claimed Token Addresses: {readValues.claimedCount}</p>
                        <p>Contract Sale Tokens: {readValues.contractTokenBalance}</p>
                        <p>Contract Payment Tokens: {readValues.contractPaymentBalance}</p>
                        <p>One Token Price: {readValues.oneTokenPrice}</p>
                        <p>Upper Limit: {readValues.upperLimit}</p>
                    </div>

                   
                </>
            ) : (
                <></>
            )}
        </>
    );
};

export default BuyTokens;
