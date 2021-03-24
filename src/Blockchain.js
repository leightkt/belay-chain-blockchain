const encrypt = require('crypto-js/sha256')
const nodeURL = process.argv[3]

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
    constructor(chain){
        this.chain = chain
        this.difficulty = 4

        this.nodeUrl = nodeURL
        this.networkNodes = []
    }

    createGenesisBlock() {
        return new Block(0, "03/17/2021", "Lynn Hill is GOAT", '0', 100)
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

    verifyHash(hash) {
        const block =  this.chain.filter(block => block.hash === hash)[0]
        const gym = block.data.gym_id
        const member = block.data.user_member_number

        const revoked = this.chain.filter(bloc => {
            return bloc.data.gym_id === gym && bloc.data.user_member_number === member && bloc.data.cert_type === "Revoke Previous Certification" && bloc.index > block.index
        })

        if (revoked.length !== 0) {
            return revoked
        } else {
            return block
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