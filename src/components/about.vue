<template>
    <div class="card" id="aboutWindow">
        <h1>Fundmatic</h1>
        <p id="description">Welcome to Fundmatic, a decentralized crowdfunding application. Projects on Fundmatic that are successfully funded will be gradually given their funds at a rate based on their specified maturity date(s). At any time during distribution supporters of a project can initiate a vote to end the distribution and return the remaining funds to the supporters. The aim is to incentivize better financial planning and lower risk exposure to supporters of crowdfunded projects.</p>
    </div>
</template>

<script>
export default {
    name: 'about',
    data() {
        return {

        }
    },
    computed: {

    },
    methods: {

    }
    
}
</script>

<style scoped>
    #aboutWindow {
        display: flex;
        flex-direction: column;
        text-align: center;
        align-content: center;
        width: 75%;
        min-height: 35vh;
        margin-top: 10%;
        margin-left: auto;
        margin-right: auto;
    }

    #description {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
    }
</style>