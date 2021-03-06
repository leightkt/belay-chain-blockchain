const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { v1: uuidv1, NIL } = require('uuid');
const reqPromise = require('request-promise')
const { Block, Node } = require('./database/mongoose')
const Blockchain = require('./src/Blockchain');
const connectDatabase = require('./database/database')
const authenticate = require('./src/authenticate')
const port = process.argv[2]
const corsOptions = {
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE'
}
const app = express();

app.use(cors(corsOptions))
app.use(express.json())



let BelayChain = {}

const loadBelayChain = () => {
    Block.find({})
        .then(blocks => {
            BelayChain = new Blockchain(blocks)
            return BelayChain
        })
        .then(BelayChain => {
            Node.find({})
                .then((nodes => {
                    nodes.forEach(node => BelayChain.networkNodes.push(node.nodeURL))
                }))
        })
}


app.get('/blockchain', authenticate, function (req, res) {
    res.send(BelayChain)
})

app.post('/addcertandbroadcast', authenticate, function (req, res) {
    const data = {
        gym_id: req.body.gym_id,
        user_member_number: req.body.user_member_number,
        cert_type: req.body.cert_type
    }

    const newCertificate = BelayChain.addBlock(data)

    if(BelayChain.isChainValid(BelayChain.chain)) {
        Block.create(newCertificate)
            .then(block => {
                const requests = []
                BelayChain.networkNodes.forEach(networkNode => {
                const requestOptions = {
                uri: networkNode + '/addcertification',
                method: 'POST',
                body: newCertificate,
                json: true
                }
                requests.push(reqPromise(requestOptions))
            
            })

            Promise.all(requests)
                .then(data => {
                    res.json( { newblock: BelayChain.getLatestBlock()} )
                })
            })
    }
})

app.post('/addcertification', function (req, res) {
    const newBlock = req.body
    const lastBlock = BelayChain.getLatestBlock()

    if (lastBlock.hash === newBlock.previousHash && lastBlock.index === newBlock.index - 1) {
            BelayChain.chain.push(newBlock)
            if(BelayChain.isChainValid(BelayChain.chain)) {
                Block.create(newBlock)
                    .then(block => res.json({ message: 'New Block added successfully' }))
            }
        } else {
            res.json({
                message: `Block already on the chain!`
            })
        }
})

app.post('/gym', authenticate, function (req, res) {
    const gymCertifications = BelayChain.findAllGymBlocks(req.body.gym_id)
    res.send(gymCertifications)
})

app.post('/member', authenticate, function (req, res) {
    const memberCertifications = BelayChain.findAllMemberBlocks(
        req.body.user_member_number, req.body.gym_id
    )
    res.send(memberCertifications)
})

app.post('/verify', function (req, res) {
    const block = BelayChain.verifyHash(req.body.hash)

    if( block ) {
        res.json(block)
    } else {
        res.json({ errors: "Could not Find Certification"})
    }
})

app.post('/register-node', authenticate, function (req, res) {
    const nodeURL = req.body.nodeURL

    if (BelayChain.networkNodes.indexOf(nodeURL) === -1
        && BelayChain.nodeUrl !== nodeURL) {
            BelayChain.networkNodes.push(nodeURL)
            Node.create({ nodeURL })
                .then(node => res.json({ message: "A node registered successfully" }))
    } else {
        res.json(
            { errors: "This node cannot register!"}
        )
    }
    
})

app.post('/register-bulk-nodes', authenticate, function (req, res) {
    const networkNodes = req.body.networkNodes

    pushNodes(networkNodes)

    async function pushNodes (networkNodes) {
        Promise.all(networkNodes.map(async (nodeURL) => {
            if (BelayChain.networkNodes.indexOf(nodeURL) === -1
                && BelayChain.nodeUrl !== nodeURL) {
                    BelayChain.networkNodes.push(nodeURL)
                const returnedNode = await Node.create({ nodeURL })
            }
        }))
            .then(response => res.json({ message: 'Bulk Register successful!'}))
    }

})

app.post('/register-and-broadcast-node', authenticate, function (req, res) {
    const nodeURL = req.body.nodeURL
    let registeredNode = ""

    if (BelayChain.networkNodes.indexOf(nodeURL) === -1
    && BelayChain.nodeUrl !== nodeURL) 
    {
        BelayChain.networkNodes.push(nodeURL)
        Node.create({ nodeURL })
            .then(response => registeredNode = response)
    } else {
        null
    }
    
    
    const id = req.token_id
    const payload = { id }
    const secret = "BootsAndBuffaloSauce"
    
    jwt.sign(payload, secret, (error, token) => {
        if (error) throw new Error("Signing Token didn't work")

        const registerNodes = []
        BelayChain.networkNodes.forEach(networkNode => {
                const requestOptions = {
                    uri: networkNode + '/register-node',
                    method: 'POST',
                    body: { nodeURL: nodeURL },
                    headers: { 'Authorization': token },
                    json: true
                }

                registerNodes.push(reqPromise(requestOptions))
        })

        Promise.all(registerNodes)
        .then(data => {
            const bulkRegisterOptions = {
                uri: nodeURL + '/register-bulk-nodes',
                method: 'POST',
                body: { networkNodes: [...BelayChain.networkNodes, BelayChain.nodeUrl]},
                headers: { 'Authorization': token },
                json: true
            }
            return reqPromise(bulkRegisterOptions)
        }).then(data => {
            res.json({ message: 'Node registered with the network successfullly!'})
        })
    })


})


app.get('/concensus', authenticate, function (req, res) {
    const id = req.token_id
    const payload = { id }
    const secret = "BootsAndBuffaloSauce"

    jwt.sign(payload, secret, (error, token) => {
        if (error) throw new Error("Signing Token didn't work")
        
        const requests = []

        BelayChain.networkNodes.forEach(nodeURL => {
            const requestOptions = {
                uri: nodeURL + '/blockchain',
                method: 'GET',
                headers: { 'Authorization': token },
                json: true
            }

        requests.push(reqPromise(requestOptions))
        })

        Promise.all(requests)
            .then(blockchains => {
                const currentChainLength = BelayChain.chain.length
                let maxChainLength = currentChainLength
                let longestChain = null
                
                blockchains.forEach(blockchain => {
                    if (blockchain.chain.length > maxChainLength) {
                        maxChainLength = blockchain.chain.length
                        longestChain = blockchain.chain
                    }
                })

                if (!longestChain || !BelayChain.isChainValid(longestChain)) {
                    res.json({
                        message: 'Current chain cannot be replaced!',
                        chain: BelayChain.chain
                    })
                } else if (longestChain && BelayChain.isChainValid(longestChain)) {
                    BelayChain.chain = longestChain
                    
                    Block.deleteMany({})
                        .then(async () => {
                            Promise.all(longestChain.map(async (block) => {
                                const blockToUpload = {
                                    index: block.index,
                                    timestamp: block.timestamp,
                                    data: block.data,
                                    previousHash: block.previousHash,
                                    hash: block.hash,
                                    nonce: block.nonce
                                }
                                const returnedBlock = await Block.create(blockToUpload)
                            }))
                            .then(res.json({
                                message: 'Chain is updated!',
                                chain: BelayChain.chain
                            }))
                        })
                }
            })
        })   

    
})

app.get('/nodes', authenticate, function (req, res) {
    res.send(BelayChain.networkNodes)
})

app.get('/validateChain', authenticate, function (req, res) {
    if (BelayChain.isChainValid(BelayChain.chain)) {
        res.json({ message: "Chain Valid"})
    } else {
        res.json({ message: "Warning: Chain Invalid!"})
    }
})



app.listen(port, loadBelayChain())

