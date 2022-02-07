const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const crowdFundFactory = await hre.ethers.getContractFactory('cfProposals');
    const crowdFund = await crowdFundFactory.deploy("0xEB796bdb90fFA0f28255275e16936D25d3418603", "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873", "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f");

    await crowdFund.deployed();
    console.log(`The homie ${deployer.address} has deployed the contract to ${crowdFund.address}`);
    /*
    let txn = await crowdFund.addProposal("My First Campaign!", "Just a test Campaign.", 5, Math.floor((new Date('2022.01.16')).getTime() / 1000), Math.floor((new Date('2022.01.14')).getTime() / 1000));
    await txn.wait();

    console.log("proposal added!");

    txn = await crowdFund.addProposal("My Second Campaign!", "Just a test Campaign.", 5, Math.floor((new Date('2022.02.16')).getTime() / 1000), Math.floor((new Date('2022.02.14')).getTime() / 1000));
    await txn.wait();

    console.log("proposal added!");

    txn = await crowdFund.addProposal("My Third Campaign!", "Just a test Campaign.", 5, Math.floor((new Date('2022.03.16')).getTime() / 1000), Math.floor((new Date('2022.03.14')).getTime() / 1000));
    await txn.wait();

    console.log("proposal added!");
    */
}

const runMain = async () => {
    try{
        await main();
        process.exit(0);
    } catch(error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();