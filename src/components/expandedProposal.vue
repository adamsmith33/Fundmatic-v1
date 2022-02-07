<template>
    <div class="expandedProp">
        <div id="campaignInfo">
            <h1>Campaign {{ prop.proposalID}}: {{prop.title}}{{campaignOverMessage}}</h1>
            <h3>{{this.dateMessage}}</h3>
            <h3>{{ prop.description }}</h3>

            <h1>We've Raised {{formatEther(prop.fundsRaised)}} DAIx out of our {{formatEther(prop.fundingGoal)}} DAIx Goal!</h1>
                       <h3 v-if="!campaignOn && !prop.isVoting">If your confidence in this project has changed and have contributed to this project, please feel free to start a vote to cancel and return remaining funds.</h3>
                       <h3 v-if="!campaignOn && prop.isVoting">A vote as been initiated. Would you like to close the stream?</h3>
                        <div id="buttons" v-if="!prop.isActive && prop.isVoting" >
                            <button class="generalButton controls" id="supportButton" @click='Vote(prop.proposalID, 1)'>Yes Close the Flow</button>
                            <button class="generalButton controls" id="supportButton" @click='Vote(prop.proposalID, 0)'>No Keep the Stream Open</button>
                        </div>
        </div>
            <br>
            <div id="rewardTiers">
                <div class="card reward" id="reward1">
                    <h2>Reward Tier 1</h2>
                    <h3 class="price">1 DAIx</h3>
                    <img src="https://i.imgur.com/BZedgLx.jpeg"/>
                    <p>This Reward is ok.</p>
                    <button class="generalButton rewardButton" @click="backProposal(prop.proposalID, 1)" v-if="campaignOn && isApproved">Support</button>
                    <button class="generalButton rewardButton" @click="approve" v-if="campaignOn && !isApproved">Approve Tokens</button>
                </div>

                <div class="card reward" id="reward2">
                    <h2>Reward Tier 2</h2>
                    <h3 class="price">2 DAIx</h3>
                    <img src="https://i.imgur.com/0gnOEpu.jpeg"/>
                    <p>This Reward is pretty good.</p>
                    <button class="generalButton rewardButton" @click="backProposal(prop.proposalID, 2)" v-if="campaignOn && isApproved">Support</button>
                    <button class="generalButton rewardButton" @click="approve" v-if="campaignOn && !isApproved">Approve Tokens</button>
                </div>

                <div class="card reward" id="reward3">
                    <h2>Reward Tier 3</h2>
                    <h3 class="price">3 DAIx</h3>
                    <img src="https://i.imgur.com/wJlOi3Z.jpeg"/>
                    <p>This Reward is awesome.</p>
                    <button class="generalButton rewardButton" @click="backProposal(prop.proposalID, 3)" v-if="campaignOn && isApproved">Support</button>
                    <button class="generalButton rewardButton" @click="approve" v-if="campaignOn && !isApproved">Approve Tokens</button>
                </div>
            </div>
            <br>
        <div id="buttons">
            <button class="generalButton controls" id="supportButton" @click='goBack'>Go Back</button>
            <button class="generalButton controls" id="supportButton" v-if="!prop.isActive && !prop.isVoting" @click="initiateVote(prop.proposalID)">Initiate Vote</button>
            <button class="generalButton controls" id="supportButton" v-if="!prop.isActive && prop.isVoting" @click='forceCheckVote(prop.proposalID)'>Force Vote</button>
        </div>
    </div>
</template>

<script>
import { ethers } from 'ethers'
export default {
    name: 'expandedProposal',
    props: [
        'prop'
    ],
    data() {
        return {
            
        }
    },
    computed: {
        computedDueDate: function(){
            let convertedDate = this.formatDate(this.prop.dueDate);
            return convertedDate;
        },
        computedMaturityDate: function(){
            let convertedDate = this.formatDate(this.prop.maturityDate);
            return convertedDate;
        },
        campaignOn: function() {
            return (this.prop.isActive);
        },
        dateMessage: function() {
            if(this.campaignOn){
                return(`Campaign Ends on ${this.computedDueDate} - Funds Gradually Distributed Until ${this.computedMaturityDate}`);
            } else {
                return(`Campaign Ended on ${this.computedDueDate} - Funds Will Gradually Distribute Until ${this.computedMaturityDate}`);
            }
        },
        campaignOverMessage: function() {
        if(!this.campaignOn){
                return(' - This Campaign is Now Over!');
            } 
        },
        isApproved: function(){
            return this.$store.state.isApproved;
        },
        isVoting: function() {
            return this.prop.isVoting;
        }
    },
    methods: {
        formatDate: function(input){
            let date = new Date(input * 1000);
            let year = date.getFullYear();
            let month = date.getMonth()+1;
            let hour = date.getHours();
            let day = date.getDate();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            return(`${month}/${day}/${year}`);
        },
        formatEther: function(amount) {
            let formatted = ethers.utils.formatEther(amount);
            return formatted;
        },        
        async approvedCheck() {
            await this.$store.dispatch("checkApproved");
        },
        async approve() {
            await this.$store.dispatch("approveToken");
        },
        goBack: function() {
            this.$emit('goBack');
            console.log("going Back.");
        },
        async backProposal(propID, amount) {
            try{
                const { ethereum } = window;
                if(!ethereum) {
                    alert("Please install Metamask!");
                    return;
                }

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const crowdFundContract = new ethers.Contract(this.$store.state.contract_address, this.$store.state.contract_abi, signer);

                //let amt = 1*(10**18);
                let amt= amount*(10^18);
                let txn = await crowdFundContract.backProposal(propID, ethers.utils.parseEther(amount.toString()), this.$store.state.contract_address);
                await txn.wait();
                console.log("Backed!");
            } catch(error) {
                console.log(error);
            }
            },
        async initiateVote(prop) {
            try{
                const { ethereum } = window;
                if(!ethereum) {
                alert("Please install Metamask!");
                return;
                }
        
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const crowdFundContract = new ethers.Contract(this.$store.state.contract_address, this.$store.state.contract_abi, signer);

                let txn = await crowdFundContract.initiateVote(prop);
                await txn.wait();
                console.log("Vote Initiated");

            } catch(error){
                console.log(error);      
            }
        },
        async Vote(index,answer) {
            try{
                const { ethereum } = window;
                if(!ethereum) {
                alert("Please install Metamask!");
                return;
                }
        
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const crowdFundContract = new ethers.Contract(this.$store.state.contract_address, this.$store.state.contract_abi, signer);

                let txn = await crowdFundContract.vote(index,answer);
                await txn.wait();
                console.log("Vote cast.");

            } catch(error){
                console.log(error);      
            }
        },
        async forceCheckVote(index) {
            try{
                const { ethereum } = window;
                if(!ethereum) {
                alert("Please install Metamask!");
                return;
                }
        
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const crowdFundContract = new ethers.Contract(this.$store.state.contract_address, this.$store.state.contract_abi, signer);

                let txn = await crowdFundContract.forceCheckVote(index);
                await txn.wait();
                console.log("Vote checked.");

            } catch(error){
                console.log(error);      
            }
        }
    },
    async mounted() {
        await this.approvedCheck();
    }

    
}
</script>

<style scoped>
    .expandedProp{
        display: flex;
        flex-direction: column;
        align-content: center;
        width: 95%;
        height: 65vh;
        overflow-x: hidden;
        overflow-y: scroll;
        margin-left: auto;
        margin-right: auto;
        margin-top: 4%;
        margin-bottom: 2%;
    }

        .expandedProp::-webkit-scrollbar {
        width: 1vh;
    }

    .expandedProp::-webkit-scrollbar-track {
        background: rgba(14, 14, 14, 0.1);
        border-radius: 10vh;
    }

    .expandedProp::-webkit-scrollbar-thumb {
        background-color: #c4c4c4;
        border-radius: 10vh;
    }

    #buttons{
        display: flex;
        justify-content: center;
        margin-left: auto;
        margin-right: auto;
    }

    .controls{
        width: 15vh;
        height: 7vh;
        margin-left: 3%;
        margin-right: 3%;
    }

    #rewardTiers{
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .reward{
        width: 28%;
        height: 55vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .price{
        margin-top:0;
    }

    .rewardButton{
        width: 50%;
        height: 3vh;
        margin-left: 1%;
        margin-right: 1%;
        margin-bottom: 10%;
    }

    img{
        width: 75%;
        margin: 1%;
        border-radius: 1vh;
    }
</style>