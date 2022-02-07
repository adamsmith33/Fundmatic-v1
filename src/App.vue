<template>
  <ul id="header">
    <li class="navItem"><div id="wordMark">FUNDMATIC</div></li>
    <li class="navItem selected" id="proposalsSelector" @click="toggleProposals"><div>Proposals</div></li>
    <li class="navItem" id="addProposalSelector" @click="toggleAddProposal"><div>Add a Proposal</div></li>
    <li class="navItem" id="aboutSelector" @click="toggleAbout"><div>About</div></li>
    <li class="navItem" id="aboutSelector" @click="toggleAbout"><div onclick="location.href='https://app.superfluid.finance/dashboard';">Wrap DAI</div></li>
    
  </ul>
  <div>
      <transition name="fade" mode="out-in">
        <component v-bind:is="currentComponent"></component>
        <!--<collection/>-->
      </transition>
  </div>
</template>

<script>
import store from './store/index.js'
import connect from './components/connect.vue'
import proposals from './components/proposals.vue'
import addProposal from './components/addProposal.vue'
import about from './components/about.vue'
import { ethers } from 'ethers'

export default {
  name: 'App',
  store: store,
  components: {
    connect,
    proposals,
    addProposal,
    about
  },
  data() {
    return {
      active: "proposals"
    }
  },
  computed: {
    getAddress: function () {
      return this.$store.state.account
    },
    networkConnected: function () {
      return (this.$store.state.currentNetwork === "0x13881")
    },
    getNetwork: function () {
      return this.$store.state.currentNetwork;
    },
    currentComponent: function () {
      if(!this.networkConnected){
        return "connect";
      } else if(this.active == "proposals"){
          return "proposals";
        } else if(this.active == "addProposal"){
          return "addProposal";
        } else if(this.active == "about"){
          return "about";
        }
    }
  },
  methods: {
      async connect() {
        await this.$store.dispatch("connect", true);
    },
    async toggle() {
      await this.$store.dispatch("checkActive");
    },
    async backProposal() {
      await this.$store.dispatch("backProposal");
    },
    async approve() {
      await this.$store.dispatch("approveToken");
    },
    async returnFlow() {
      await this.$store.dispatch("returnFlow");
    },
    toggleProposals() {
        if(this.active !== "proposals" && !this.$store.state.mining){
          this.active = "proposals";
          document.getElementById('addProposalSelector').classList.remove('selected');
          document.getElementById('aboutSelector').classList.remove('selected');
          document.getElementById('proposalsSelector').classList.add('selected');
        }
      },
    toggleAddProposal() {
        if(this.active !== "addProposal" && !this.$store.state.mining){
          this.active = "addProposal";
          document.getElementById('proposalsSelector').classList.remove('selected');
          document.getElementById('aboutSelector').classList.remove('selected');
          document.getElementById('addProposalSelector').classList.add('selected');
        }
      },
    toggleAbout() {
        if(this.active !== "about" && !this.$store.state.mining){
          this.active = "about";
          document.getElementById('proposalsSelector').classList.remove('selected');
          document.getElementById('addProposalSelector').classList.remove('selected');
          document.getElementById('aboutSelector').classList.add('selected');
        }
      },
      
  },
  async mounted() {
    await this.connect();
  },
}
</script>

<style>
#app {
  color: white;
}

.selected {
  text-decoration: underline;
}

.navItem {
  transition: all .1s ease;
}

.navItem:hover {
  cursor: pointer;
  transform: scale(1.02);
}

.fade-enter-active, .fade-leave-active {
  transition: all .4s ease;
}
.fade-enter-from, .fade-leave-to {
  transform: translatey(40px);
  opacity: 0;
}
</style>
