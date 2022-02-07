<template>
<div>
    <h2>FUNDMATIC</h2>
    <h2>Current Campaigns</h2>
    <ul class='propList'>
        <li class="card propCard" v-for="prop in proposals" @click='expand(prop)'>
            <h2 class="propTitle">{{ prop.title }}</h2><h2 v-if="!prop.isActive">This Campaign is now Over!</h2>
            <h3 class="propGoal">{{formatEther(prop.fundsRaised)}} DAIx Raised of a {{formatEther(prop.fundingGoal)}} DAIx Goal!</h3>
            <h3 class="propGoal">Campaign Expiry: {{formatDate(prop.dueDate)}}</h3>
            <p class="propDesc">{{ prop.description }}</p>
        </li>
    </ul>
    </div>
</template>

<script>
import { ethers } from 'ethers'
export default {
    name: 'proposalsList',    
    props: [
        'prop'
    ],
    data() {
        return {

        }
    },
    computed: {
        proposals: function() {
            return this.$store.state.proposals;
        },        
        computedDueDate: function(){
            let convertedDate = this.formatDate(this.prop.dueDate);
            return convertedDate;
        },
        computedMaturityDate: function(){
            let convertedDate = this.formatDate(this.prop.maturityDate);
            return convertedDate;
        },
        campaignOn: function() {
            console.log(this.prop.isActive);
            return (this.prop.isActive);
        },
        campaignOverMessage: function() {
        if(this.campaignOn){
                console.log(this.campaignOn);
            } else{
            return(' - This Campaign is Now Over!');
            }
        },
        endor: function(){
            if(this.campaignOn){
                return 'ends';
            } else {
                return 'ended';
            }
        }
    },
    methods: {
            async fetchActiveProposals() {
            await this.$store.dispatch("getProposals");
        },
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
        expand: function(prop) {
            this.$emit('expand', prop);
            console.log("emitted");
        }
    },
    async mounted() {
        this.fetchActiveProposals();
    }
}
</script>

<style scoped>

    .propList {
        list-style: none;
        display: flex;
        flex-direction: column;
        text-align: center;
        width: 80%;
        height: 55vh;
        margin-left: auto;
        margin-right: auto;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .propList::-webkit-scrollbar {
        width: 1vh;
    }

    .propList::-webkit-scrollbar-track {
        background: rgba(14, 14, 14, 0.1);
        border-radius: 10vh;
    }

    .propList::-webkit-scrollbar-thumb {
        background-color: #c4c4c4;
        border-radius: 10vh;
    }

    .propCard {
        display: flex;
        flex-direction: column;
        align-content: center;
        width: 80%;
        max-height: 60vh;
        margin-left: auto;
        margin-right: auto;
        margin-top: 1%;
        margin-bottom: 2%;
        padding-bottom: 1%;
        filter: drop-shadow(10px 10px 15px rgba(14, 14, 14, 0.35));
        transition: all 0.3s ease-out;
    }

    .propCard:hover {
        cursor: pointer;
        transform: scale(1.01);
    }

    .propTitle {
        margin-bottom: 0;
    }

    .propGoal {

    }

    .propDesc {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
    }
</style>