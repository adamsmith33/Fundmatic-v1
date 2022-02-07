import { ethers, utils } from 'ethers';
import { createStore } from 'vuex'
import abi from './utils/crowdFund.json'
import dai from './utils/daiABI.json'
import { daiABI } from './utils/config.js';
import { BigNumber } from "bignumber.js";

export default createStore({
  state: {
    account: null,
    error: null,
    mining: false,
    currentNetwork: null,
    proposals: null,
    contract_address: '0xC8C59EC7e822e6836e5894b51a11538fe6D1EFF0',
    contract_abi: abi.abi,
    daiABI: daiABI,
    isApproved: null
  },
  mutations: {
    setAccount(state, account) {
      state.account = account;
    },
    setError(state, error) {
      state.error = `${error}`;
    },
    setNetwork(state, network) {
      state.currentNetwork = `${network}`;
    },
    toggleMining(state, status) {
      state.mining = status;
    },
    updateProposals(state, proposals) {
      state.proposals = proposals;
    },
    setApproved(state, isApproved) {
      state.isApproved = isApproved;
    }
  },
  actions: {
    async connect({ commit, dispatch }, connect) {
      try {
        const { ethereum } = window;

        if(!ethereum){
          commit("setError", "Metamask not installed!");
          return;
        }

        if(!(await dispatch("checkIfConnected") && connect)) {
          await dispatch("requestAccess");
        }

        await dispatch("checkNetwork");

      } catch(error) {
        //console.log(error);
        commit("setError", "Account request refused.");
      }
    },
    async checkNetwork({ commit, dispatch }) {
        let chainId = await ethereum.request({ method: "eth_chainId" });
        const rinkebyChainId = "0x13881";
        if(chainId !== rinkebyChainId){
          if(!(await dispatch("switchNetwork"))) {
            commit("setNetwork", chainId);
            commit("setError", "You are not connected to the Rinkeby Test Network.");
          } else {
            chainId = await ethereum.request({ method: "eth_chainId" });
            commit("setNetwork", chainId);
          }
        } else {
          commit("setNetwork", chainId);
        }
      },
    async switchNetwork() {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }]
        });

      return 1;
      } catch(error){
        commit("setError", error);
        return 0;
      }
    },
    async checkIfConnected({ commit }) {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if(accounts.length !== 0) {
        commit("setAccount", accounts[0]);
        return 1;
      } else {
        return 0;
      }
    },
    async requestAccess({ commit }) {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      commit("setAccount", accounts[0]);
    },
    async getProposals({ state, commit }) {
      const { ethereum } = window;
      if(!ethereum) {
        alert("Please install Metamask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const crowdFundContract = new ethers.Contract(state.contract_address, state.contract_abi, signer);

      let txn = await crowdFundContract.getActivePropDetails();

      commit("updateProposals", txn);

    },
    async checkActive({ state, commit }) {
      try{
      const { ethereum } = window;
      if(!ethereum) {
        alert("Please install Metamask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const crowdFundContract = new ethers.Contract(state.contract_address, state.contract_abi, signer);

      let txn = await crowdFundContract.toggleActive(10);
      await txn.wait();
      console.log("toggled");

      txn = await crowdFundContract.getActivePropDetails();

      commit("updateProposals", txn);
    } catch(error){
      console.log(error);
      commit("setError", error);
    }
    },

    async backProposal({state, commit}, propID, amount) {
      try{
      const { ethereum } = window;
      if(!ethereum) {
        alert("Please install Metamask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const crowdFundContract = new ethers.Contract(state.contract_address, state.contract_abi, signer);

      //let amt = 1*(1^18);
      
      let txn = await crowdFundContract.backProposal(propID, ethers.utils.parseEther(amount), state.contract_address);
      await txn.wait();
      console.log("Backed!");
    } catch(error) {
      console.log(error);
      commit("setError", error);
    }
    },
    async approveToken({state, commit}) {
      try{
        const { ethereum } = window;
        if(!ethereum) {
          alert("Please install Metamask!");
          return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crowdFundContract = new ethers.Contract('0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f', state.daiABI, signer);

        let amt = (2^256 - 1)*(100*10^18);
        
        let txn = await crowdFundContract.approve(state.contract_address, ethers.utils.parseEther(amt.toString()));
        console.log("approved");

        const crowdFundContract2 = new ethers.Contract(state.contract_address, state.contract_abi, signer);

        txn = await crowdFundContract2.setApproved();
        await txn.wait();

        console.log("you're approved now.");

      } catch(error) {
        console.log(error);
        commit("setError", error);
      }
    },
    async addProposal({state, commit}, title, description, goal, dueDate) {
      try{
        const { ethereum } = window;
        if(!ethereum) {
          alert("Please install Metamask!");
          return;
        }
  
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crowdFundContract = new ethers.Contract(state.contract_address, state.contract_abi, signer);

        let txn = await crowdFundContract.addProposal(title, description, goal, dueDate);

      } catch(error){
        console.log(error);      
        commit("setError", error);
      }
    },

    async checkApproved({ state,commit }){
      try{
        const { ethereum } = window;
        if(!ethereum) {
          alert("Please install Metamask!");
          return;
        }
  
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const crowdFundContract = new ethers.Contract(state.contract_address, state.contract_abi, signer);

        let txn = await crowdFundContract.isApproved();
        commit("setApproved", txn);

      } catch(error){
        console.log(error);      
        commit("setError", error);
      }
    },

  },
  modules: {
  }
})
