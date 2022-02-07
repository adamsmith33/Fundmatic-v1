// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

import {flowLogic, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./flowLogic.sol";

import "hardhat/console.sol";

interface fDAIxToken {
        function approve(address spender, uint256 amount) external returns (bool);
        function transferFrom(address sender,address recipient,uint256 amount) external returns (bool);
}

contract cfProposals is KeeperCompatibleInterface, flowLogic {
    fDAIxToken IfDAIx;

    using Counters for Counters.Counter;

    Counters.Counter private proposalIDs;
    Counters.Counter private activeProposals;

    struct proposal {
        uint256 proposalID;
        address proposalOwner;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 fundsRaised;
        uint256 dateCreated;
        uint256 dueDate;
        uint256 maturityDate;
        uint256 dateCompleted;
        bool isActive;
        bool isFlowing;
        bool isVoting;
        uint256 voteStarted;
        uint256 voteDuedate;
    }


    proposal[] proposals;

    address public fDAIx;
    address public fDAI;

    mapping (uint256 => mapping(address => uint256)) propAddressToPledge;
    mapping (uint256 => Counters.Counter) propBackerCount;
    mapping (uint256 => address[]) propBackers;
    mapping (address => bool) approved;
    //mapping (uint256 => Counters.Counter[]) propVotes; //index 0 is votes for no, index 1 is notes for yes
    mapping (uint256 => Counters.Counter) yesVotes;
    mapping (uint256 => Counters.Counter) noVotes;
    mapping (uint256 => mapping(address => bool)) hasVoted;

    constructor(
    ISuperfluid host,
    IConstantFlowAgreementV1 cfa,
    ISuperToken acceptedToken) flowLogic(host, cfa, acceptedToken) {
        console.log("It's....ALIVE!!!");

        IfDAIx = fDAIxToken(0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f);

    }

    function isApproved() public view returns(bool){
        return approved[msg.sender];
    }

    function setApproved() public{
        approved[msg.sender] = true;
    }

    function addProposal(string memory title, string memory description, uint256 goal, uint256 maturityDate, uint256 dueDate) public {
        uint256 ID = proposalIDs.current();
        proposals.push(proposal({
            proposalID: ID,
            proposalOwner: msg.sender,
            title: title,
            description: description,
            fundingGoal: goal,
            fundsRaised: 0,
            dateCreated: block.timestamp,
            dueDate: dueDate,
            maturityDate: maturityDate,
            dateCompleted: 0,
            isActive: true,
            isFlowing: false,
            isVoting: false,
            voteStarted: 0,
            voteDuedate: 0
        }));

        proposalIDs.increment();
        activeProposals.increment();
    }


    function getProposal(uint256 index) public view returns(proposal memory) {
        return proposals[index];
    }

    function backProposal(uint256 index, uint256 amount, address receiver) public payable{
        require(amount > 0, "PAY MOAR");
        require(proposals[index].isActive, "This campaign is no longer collecting funds!");
        //proposal memory selected = proposals[index];

            IfDAIx.transferFrom(msg.sender, receiver, amount);

            proposals[index].fundsRaised = proposals[index].fundsRaised + amount;

        if(propAddressToPledge[index][msg.sender] <= 0){
            propBackers[index].push(msg.sender);
            propBackerCount[index].increment();
            console.log("New Backer Added! Now there are %s Backers.", propBackerCount[index].current());
        } 

        propAddressToPledge[index][msg.sender] = propAddressToPledge[index][msg.sender] + amount;
    }

    function toggleActive(uint256 index) public {
        proposal memory selected = proposals[index];
        uint256 currentTime = block.timestamp;
        if(currentTime >= selected.dueDate && selected.isActive) {
            proposals[index].isActive = false;
            proposals[index].dateCompleted = block.timestamp;
            console.log("Proposal Closed");
            
            if(selected.fundsRaised >= selected.fundingGoal){  
                uint256 duration = selected.maturityDate - selected.dateCompleted;
                uint256 flowrate = selected.fundsRaised/duration;
                int converted = int(flowrate);
                int96 convertedNew = int96(converted);

                createFlow(selected.proposalOwner, (convertedNew*625)); //flowrate was slightly off from calculation
                proposals[index].isFlowing = true;
                } else {
                    activeProposals.decrement();
                }

        } else if(currentTime >= selected.maturityDate && selected.isFlowing){
                activeProposals.decrement();
                deleteFlow(selected.proposalOwner);
                proposals[index].isFlowing = false;
        } else {
            console.log("There's still time to support!");
        }

        if(selected.isVoting && selected.isFlowing && currentTime >= selected.voteDuedate){
            uint256 no = noVotes[index].current();
            uint256 yes = yesVotes[index].current();

            if(yes > no){
                activeProposals.decrement();
                deleteFlow(selected.proposalOwner);
                proposals[index].isFlowing = false;
                proposals[index].isVoting = false;
            } else {
                proposals[index].isVoting = false;
                proposals[index].voteDuedate = 0;
                noVotes[index].reset();
                yesVotes[index].reset();
                
            }
        }
    }

    function forceCheckVote(uint256 index) public {
        proposal memory selected = proposals[index];
        if(selected.isVoting && selected.isFlowing){
            uint256 no = noVotes[index].current();
            uint256 yes = yesVotes[index].current();

            if(yes > no){
                activeProposals.decrement();
                deleteFlow(selected.proposalOwner);
                proposals[index].isFlowing = false;
                proposals[index].isVoting = false;
                hasVoted[index][msg.sender] = false;
            } else {
                proposals[index].isVoting = false;
                proposals[index].voteDuedate = 0;
                noVotes[index].reset();
                yesVotes[index].reset();
                hasVoted[index][msg.sender] = false;
                
            }
        }
    }

    function initiateVote(uint256 index) public {
        require(propAddressToPledge[index][msg.sender] > 0, "You didn't contribute to this.");
        require(!proposals[index].isActive, "Funds are still being collected.");
        require(!proposals[index].isVoting, "A vote has already been initiated!");

        proposals[index].isVoting = true;
        uint256 currentTime = block.timestamp;

        uint256 ballotsClose = currentTime + 7 days;

        proposals[index].voteStarted = currentTime;
        proposals[index].voteDuedate = ballotsClose;
    }

    function vote(uint256 index, uint256 answer) public {
        require(propAddressToPledge[index][msg.sender] > 0, "You didn't contribute to this.");
        require(proposals[index].isVoting, "There isn't a vote right now.");
        require(!hasVoted[index][msg.sender], "You've already voted!");
        require(answer == 0 || answer == 1, "That doesn't work.");

        if(answer == 1){
            yesVotes[index].increment();
        } else if(answer == 0) {
            noVotes[index].increment();
        }

        hasVoted[index][msg.sender] = true;


    }

    function checkVotes(uint256 index) public view returns(uint256[] memory){
        uint256[] memory votes;
        votes[0] = noVotes[index].current();
        votes[1] = yesVotes[index].current();
        return votes;
    }

    function getActiveProposals() public view returns(uint256[] memory) {
        uint counter = 0;
        uint256 arrayLength = activeProposals.current();
        console.log(arrayLength);
        uint256[] memory allActive = new uint256[](arrayLength);
        
        for(uint i = 0; i  < proposals.length; i++) {
        proposal memory inQuestion = proposals[i];
        console.log("proposal Found");
            if(inQuestion.isActive || inQuestion.isFlowing){
                console.log("gonna do it");
                allActive[counter] = i;
                console.log("did it");
                console.log("counter incrememnted");
                counter++;
            }
            }
            console.log(allActive.length);
            return allActive;
        }

        function getActivePropDetails() public view returns(proposal[] memory){
            uint counter = 0;
            proposal[] memory allActive = new proposal[](activeProposals.current());
        
            for(uint i = 0; i  < proposals.length; i++) {
                proposal memory inQuestion = proposals[i];
                    if(inQuestion.isActive || inQuestion.isFlowing){
                        allActive[counter] = (proposal({
                    proposalID: inQuestion.proposalID,
                    proposalOwner: inQuestion.proposalOwner,
                    title: inQuestion.title,
                    description: inQuestion.description,
                    fundingGoal: inQuestion.fundingGoal,
                    fundsRaised: inQuestion.fundsRaised,
                    dateCreated: inQuestion.dateCreated,
                    dueDate: inQuestion.dueDate,
                    maturityDate: inQuestion.maturityDate,
                    dateCompleted: inQuestion.dateCompleted,
                    isActive: inQuestion.isActive,
                    isFlowing: inQuestion.isFlowing,
                    isVoting: inQuestion.isVoting,
                    voteStarted: inQuestion.voteStarted,
                    voteDuedate: inQuestion.voteDuedate
                    }));
                    counter++;
                }
            }

            return(allActive);
        }


    function checkUpkeep(bytes calldata) external view override returns(bool upkeepNeeded, bytes memory) {
        upkeepNeeded = false;

        uint256[] memory allActive = getActiveProposals();

        for(uint i = 0; i < allActive.length; i++) {
            if(block.timestamp > proposals[allActive[i]].dueDate){
                upkeepNeeded = true;
            }
        }
        console.log("Done Checking for Upkeep.");
    }

    function performUpkeep(bytes calldata) external override {
        
        uint256[] memory allActive = getActiveProposals();
        for(uint i = 0; i < allActive.length; i++) {
            uint256 selected = allActive[i];
            toggleActive(selected);
        }
    
        console.log("Done Performing Upkeep.");
    }

}