const PaymentToken = artifacts.require("PaymentToken");
const SaleToken = artifacts.require("SaleToken");
const PrivateSale = artifacts.require("PrivateSale");

module.exports = async function (deployer, network, accounts) {
    // PaymentToken'ı deploy ediyorum.
    await deployer.deploy(PaymentToken);
    const paymentToken = await PaymentToken.deployed();
    const ownerAddress = accounts[0]; // Deployer hesabını owner olarak kabul ettim

    //  SaleToken'ı deploy ediyorum
    await deployer.deploy(SaleToken);
    const saleToken = await SaleToken.deployed();

    //  Satış fiyatı ve üst limit değerlerini belirledim
    const oneTokenPrice = 1 
    const upperLimit = 100; 

   // PrivateSale kontratını deploy ettim
    await deployer.deploy(
        PrivateSale,
        paymentToken.address,
        saleToken.address,
        oneTokenPrice,
        upperLimit
    );
    const privateSale = await PrivateSale.deployed();

    console.log(`PrivateSale deployed at address: ${privateSale.address}`);

    // Whitelist'e alınacak kullanıcıları burada listeledim.
    const whitelistAddresses = [
        '0xb2634FeBA9bC30C2c070EB0d660FbF2336FDBe91',
         "0x8d769F99B132C4147e87C855efBac51B074e0Bd1",
         "0x5708814f4cAAcE06E31D6829695513BF5626A44C"

    
    ];

    // Whitelist ekleme işlemi
    await privateSale.addWL(whitelistAddresses, { from: ownerAddress });

    //  Her bir whitelist adresine USDT transfer ettim
    for (const address of whitelistAddresses) {
        await paymentToken.transfer(address, web3.utils.toWei("10", "mwei"), { from: ownerAddress });
        console.log(`${address} USDT has been transferred to the Whitelist address.`);
    }

    //  SaleToken'ları PrivateSale kontratına transfer etim gerekli bir işlem olup olmadığını öğrenmek ve test etmek
    // adına bu işlemi gerçekleştirdim ve mwei gwei ether gibi parametreleri öğrenebilmek için cinslerini utils kullanarak gönderdim
    await saleToken.transfer(privateSale.address, web3.utils.toWei("100000", "ether"), { from: ownerAddress });
   
    console.log("SaleToken has been transferred to the PrivateSale contract.");

    await privateSale.changeStatus(1);
    console.log("status 1") // Status durumunu konsol yerine buradan ayarladım

    // Adresleri frontend tarafına hızlıca geçirebilmek için tekrar konsola bastırdım
    console.log(`privateSale deployed at address: ${privateSale.address}`);
    console.log(`paymentToken deployed at address: ${paymentToken.address}`);
    console.log(`SaleToken deployed at address: ${saleToken.address}`);


    console.log("Migration completed!");
};
