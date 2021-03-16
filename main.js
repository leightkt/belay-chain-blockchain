const encrypt = require('crypto-js/sha256')

class Block {
    constructor(index, timestamp, data, previousHash = '', nonce = 0) {
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
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0")
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.mineBlock(this.difficulty)
        // newBlock.hash = newBlock.calculateHash()
        this.chain.push(newBlock)
    }

    isChainValid() {
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1]

            if(currentBlock.hash !== currentBlock.calculateHash()) {
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
            console.log(true)
        } else {
            console.log(blockToVerify)
        }
    }
}


let Katchain = new Blockchain()
console.log("mining block 1. . . .")
let data1 = {
    gym_id: 1,
    user_member_number: 1234,
    cert_type: "Lead"
}
Katchain.addBlock(new Block(1, Date.now(), data1))


// console.log(JSON.stringify(Katchain, null, 4))
console.log(Katchain.getLatestBlock())
console.log(JSON.stringify(Katchain.getLatestBlock(), null, 4))
// console.log('Is blockchain valid?', Katchain.isChainValid())

// Katchain.chain[1].data = { amount: 100}
// Katchain.chain[1].hash = Katchain.chain[1].calculateHash()
// console.log('Is blockchain valid?', Katchain.isChainValid())
let strungifiedIT = JSON.stringify(Katchain.getLatestBlock())
let lastBlockObj = JSON.parse(strungifiedIT)

lastBlock = new Block(lastBlockObj.index, lastBlockObj.timestamp, lastBlockObj.data, lastBlockObj.previousHash, lastBlockObj.nonce)

console.log(Katchain.validateBlock(lastBlock))
