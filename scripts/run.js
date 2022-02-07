const getTime = (prop) => {
    let date = new Date(prop.dueDate * 1000);
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let hour = date.getHours();
    let day = date.getDate();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    return(`${hour}:${minutes}:${seconds} on ${month}/${day}/${year}`);
}

const makeDate = (inputDate) => {
    let date = Math.floor(new Date(inputDate).getTime() / 1000);
    return date;
}

const main = async () => {
    const [deployer, rando] = await hre.ethers.getSigners();
    const crowdFundFactory = await hre.ethers.getContractFactory('cfProposals');
    const crowdFund = await crowdFundFactory.deploy("0xEB796bdb90fFA0f28255275e16936D25d3418603", "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873", "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f");

    await crowdFund.deployed();
    console.log(`The homie ${deployer.address} has deployed the contract to ${crowdFund.address}`);

    let txn = await crowdFund.addProposal("My First Campaign!", "Just a test Campaign.", "500000000000000", Math.floor((new Date('2022.01.14')).getTime() / 1000));
    await txn.wait();

    console.log("proposal added!");

    txn = await crowdFund.addProposal("My Second Campaign!", "Just a test Campaign.", "500000000000000", Math.floor((new Date('2022.02.14')).getTime() / 1000));
    await txn.wait();

    console.log("proposal added!");

    txn = await crowdFund.addProposal("My Third Campaign!", "Just a test Campaign.", "500000000000000", Math.floor((new Date('2022.03.14')).getTime() / 1000));
    await txn.wait();

    console.log("proposal added!");

    txn = await crowdFund.getActiveProposals();
 
    console.log(txn);

    txn = await crowdFund.getProposal(0);
    console.log(ethers.utils.formatEther(txn.fundsRaised));

    console.log(getTime(txn));

    txn = await crowdFund.backProposal(0, {value: 100000000000000});
    await txn.wait();
    console.log("Project backed!");

    txn = await crowdFund.getProposal(0);
    console.log(ethers.utils.formatEther(txn.fundsRaised));

    txn = await crowdFund.backProposal(0, {value: 100000000000000});
    await txn.wait();
    console.log("Project backed!");

    txn = await crowdFund.getProposal(0);
    console.log(ethers.utils.formatEther(txn.fundsRaised));

    txn = await crowdFund.backProposal(0, {value: 100000000000000});
    await txn.wait();
    console.log("Project backed!");

    txn = await crowdFund.getProposal(0);
    console.log(ethers.utils.formatEther(txn.fundsRaised));
    
    txn = await crowdFund.connect(rando).backProposal(0, {value: 100000000000000});
    await txn.wait();
    console.log("Project backed!");

    txn = await crowdFund.getProposal(0);
    console.log(ethers.utils.formatEther(txn.fundsRaised));

    txn = await crowdFund.getActiveProposals();

    console.log(txn);
    
    txn = await crowdFund.checkUpkeep(0);
    console.log(txn);

    txn = await crowdFund.performUpkeep(0);
    await txn.wait();

    txn = await crowdFund.getActiveProposals();

    console.log(txn);

    txn = await crowdFund.getActivePropDetails();

    console.log(txn);

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