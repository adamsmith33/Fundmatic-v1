<template>
    <div class='card' id="addProposalsWindow">
        <h2>Add Proposal</h2>
        <form>
            <div class="topSection">
                <div>
                    <label for="propTitle">Proposal Title</label><br>
                    <input type="text" id="propTitle" name="propTitle" v-model="title">
                </div>
                <div>
                    <label for="propTitle">Goal (In DAI)</label><br>
                    <input type="text" id="propTitle" name="propTitle" v-model="goal">
                </div>
            </div>

            <label for="propDescription">Description</label><br>
            <textarea rows="4" cols="50" id="propDescription" name="propDescription" v-model="description"/><br><br>

            <div class="bottomSection">
                    <div>
                        <label for="endDate">Campaign End Date</label><br>
                        <input type="date" id="endDate" name="endDate" v-model="campaignEndDate">
                    </div>
                    <div>
                        <label for="maturityDate">Fund Maturity Date</label><br>
                        <input type="date" id="maturityDate" name="maturityDate" v-model="maturityDate"> 
                </div>
            </div>
            <br>
        </form>
        <button class="generalButton" id="submitButton" @click="addProposal">Submit</button>
    </div>
</template>

<script>
import { ethers } from 'ethers'

    export default {
        name: 'addProposal',
        data() {
            return {
                title: '',
                description: '',
                goal: null,
                campaignEndDate: null,
                maturityDate: null

            }
        },
        computed: {
            campaignConverted: function() {
                let convertedDate = Math.floor(new Date(`${this.campaignEndDate}`).getTime() / 1000);
                if(convertedDate) {
                    return convertedDate;
                }
            },
            maturityConverted: function() {
                let convertedDate = Math.floor(new Date(`${this.maturityDate}`).getTime() / 1000);
                if(convertedDate) {
                    return convertedDate;
                }
            },
            goalConverted: function() {
                let convertedGoal = ethers.utils.parseEther(this.goal);
                return convertedGoal;
            }
        },
        methods: {
            async addProposal() {
                try{
                    const { ethereum } = window;
                    if(!ethereum) {
                    alert("Please install Metamask!");
                    return;
                    }
            
                    const provider = new ethers.providers.Web3Provider(ethereum);
                    const signer = provider.getSigner();
                    const crowdFundContract = new ethers.Contract(this.$store.state.contract_address, this.$store.state.contract_abi, signer);

                    let txn = await crowdFundContract.addProposal(this.title, this.description, this.goalConverted, this.maturityConverted, this.campaignConverted);
                    await txn.wait();
                    console.log('done');

                } catch(error){
                    console.log(error);      
                }
        },
        
        },
        mounted() {

        }
    }
</script>

<style scoped>
    #addProposalsWindow {
        display: flex;
        flex-direction: column;
        text-align: center;
        align-content: center;
        width: 75%;
        min-height: 75vh;
        margin-left: auto;
        margin-right: auto;
    }

    #propDescription{
        width:  75%;
        height: 25vh;
        margin-bottom: 3%;
        align-content: flex-start;
    }

    .topSection {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-bottom: 5%;
    }

    .bottomSection {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-bottom: 4%;
    }

    #submitButton {
        width: 30%;
        height: 5vh;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 4%;
    }
</style>