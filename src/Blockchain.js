const encrypt = require('crypto-js/sha256')
const nodeURL = process.argv[3]

class Block {
    constructor(index, timestamp, data, previousHash = '', hash = '', nonce = 0) {
        this.index = index
        this.timestamp = timestamp
        this.data = data
        this.previousHash = previousHash
        this.hash = this.calculateHash()
        this.nonce = nonce
    }

    calculateHash() {
        return encrypt(
            this.index + 
            this.timestamp + 
            JSON.stringify(this.data) +
            this.previousHash +
            this.nonce
        ).toString()
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== "0".repeat(difficulty)) {
            this.nonce ++
            this.hash = this.calculateHash()
        }

        console.log("Block mined:" + this.hash)
    }
}

class Blockchain {
    constructor(){
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 4

        this.nodeUrl = nodeURL
        this.networkNodes = []
    }

    createGenesisBlock() {
        return new Block(0, "03/17/2021", "Lynn Hill is GOAT", 0, 100)
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            data
        )
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock)
        return newBlock
    }

    calculateHash(block) {
        return encrypt(
            block.index + 
            block.timestamp + 
            JSON.stringify(block.data) +
            block.previousHash +
            block.nonce
        ).toString()
    }

    isChainValid(chain) {
        if (!chain) {
            return null
        }
        
        for(let i = 1; i < chain.length; i++){
            const currentBlock = chain[i]
            const previousBlock = chain[i - 1]

            if(currentBlock.hash !== this.calculateHash(currentBlock)) {
                return false
            }

            if(currentBlock.previousHash !== previousBlock.hash) {
                return false
            }
        }

        return true
    }

    validateBlock(blockToVerify) {
        blockToVerify.hash = blockToVerify.calculateHash()
        if(this.chain[blockToVerify.index].hash === blockToVerify.hash){
            return true
        } else {
            return false
        }
    }

    findAllGymBlocks(gym_id) {
        return this.chain.filter(block => block.data.gym_id === gym_id)
    }

    findAllMemberBlocks(user_member_number, gym_id) {
        return this.chain.filter(block => block.data.gym_id === gym_id && block.data.user_member_number === user_member_number)
    }
}

module.exports = Blockchain


// let Katchain = new Blockchain()
// console.log("mining block 1. . . .")
// let data1 = {
//     gym_id: 1,
//     user_member_number: 1234,
//     cert_type: "Lead"
// }
// Katchain.addBlock(new Block(1, Date.now(), data1))
// console.log("mining block 2. . . .")
// let data2 = {
//     gym_id: 1,
//     user_member_number: 5678,
//     cert_type: "Top Rope"
// }
// Katchain.addBlock(new Block(1, Date.now(), data2))

// console.log(Katchain.isChainValid(Katchain.chain))
// console.log(Katchain.chain)

// console.log("mining block 3. . . .")
// let data3 = {
//     gym_id: 2,
//     user_member_number: 9101112,
//     cert_type: "Top Rope"
// }
// Katchain.addBlock(new Block(1, Date.now(), data3))

// console.log("mining block 4. . . .")
// let data4 = {
//     gym_id: 2,
//     user_member_number: 9101112,
//     cert_type: "Lead"
// }
// Katchain.addBlock(new Block(1, Date.now(), data4))

// console.log("mining block 5. . . .")
// let data5 = {
//     gym_id: 2,
//     user_member_number: 9101112,
//     cert_type: "Belay Certification Revoked"
// }
// Katchain.addBlock(new Block(1, Date.now(), data5))

// console.log(Katchain.findAllGymBlocks(1))
// console.log(Katchain.findAllUserBlocks(9101112, 2))

// console.log(JSON.stringify(Katchain, null, 4))
// console.log('Is blockchain valid?', Katchain.isChainValid())

// Katchain.chain[1].data = { amount: 100}
// Katchain.chain[1].hash = Katchain.chain[1].calculateHash()
// console.log('Is blockchain valid?', Katchain.isChainValid())



// let strungifiedIT = JSON.stringify(Katchain.getLatestBlock())
// let lastBlockObj = JSON.parse(strungifiedIT)

// lastBlock = new Block(lastBlockObj.index, lastBlockObj.timestamp, lastBlockObj.data, lastBlockObj.previousHash, lastBlockObj.nonce)

// console.log(Katchain.validateBlock(lastBlock))
