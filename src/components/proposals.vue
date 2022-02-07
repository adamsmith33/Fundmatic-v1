<template>
    <div class="card" id="proposalsWindow" >
        <transition name="fade" mode="out-in">
            <component v-bind:is="currentComponent" @expand="expandCard" @goBack="returnToList" :prop='selected'></component>
            <!--<collection/>-->
        </transition>
    </div>
</template>

<script>
import proposalsList from './proposalsList.vue'
import expandedProposal from './expandedProposal.vue'
export default {
    name: 'proposals',
    components: {
        proposalsList,
        expandedProposal
    },
    data() {
        return {
            active: 'list',
            selected: {},
            
        }
    },
    computed: {
        proposals: function() {
            return this.$store.state.proposals;
        },
        currentComponent: function() {
            if(this.active == 'list'){
                return 'proposalsList'
            } else if(this.active =='expandedProposal'){
                return 'expandedProposal';
            }
        }
    },
    methods: {
        async fetchActiveProposals() {
            await this.$store.dispatch("getProposals");
        },
        expandCard: function(prop) {
            this.selected = prop;
            this.active = 'expandedProposal';
        },
        returnToList: function(){
            this.active='list';
        }
    }
}
</script>

<style scoped>
    #proposalsWindow {
        display: flex;
        flex-direction: column;
        text-align: center;
        width: 75%;
        min-height: 75vh;
        margin-left: auto;
        margin-right: auto;
    }

    .fade-enter-active, .fade-leave-active {
    transition: all .4s ease;
    }
    .fade-enter-from, .fade-leave-to {
    transform: translatey(40px);
    opacity: 0;
    }

</style>