const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const { v1: uuidv1 } = require('uuid');
const nodeAddress = uuidv1()
const reqPromise = require('request-promise')


// const port = process.env.PORT || 9000
const port = process.argv[2]
const corsOptions = {
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE'
}

const app = express();
app.use( bodyParser.urlencoded({ extended: false}) )
app.use(bodyParser.json());
app.use( cors(corsOptions) )


const Blockchain = require('./src/Blockchain')
const BelayChain = new Blockchain()



app.post('/register-node', function (req, res) {
    const nodeURL = req.body.nodeURL

    if ((BelayChain.networkNodes.indexOf(nodeURL) === -1) 
        && (BelayChain.nodeUrl !== nodeURL)) {
            BelayChain.networkNodes.push(nodeURL)
            
        res.json(
            { message: "A node registered successfully"}
        )
    } else {
        res.json(
            { errors: "This node cannot register!"}
        )
    }
    
})

app.post('/register-bulk-nodes', function (req, res) {
    const networkNodes = req.body.networkNodes

    networkNodes.forEach(nodeURL => {
        if((BelayChain.networkNodes.indexOf(nodeURL) === -1)
        && (BelayChain.nodeURL !== nodeURL)) {
            BelayChain.networkNodes.push(nodeURL)
        }
    })

    res.json(
        { message: 'Bulk Register successful!'}
    )
})

app.post('/register-and-broadcast-node', function (req, res) {
    const nodeURL = req.body.nodeURL
    
    if (BelayChain.networkNodes.indexOf(nodeURL) === -1) {
        BelayChain.networkNodes.push(nodeURL)
    }

    const registerNodes = []
    BelayChain.networkNodes.forEach(networkNode => {
        const requestOptions = {
            uri: networkNode + '/register-node',
            method: 'POST',
            body: { nodeURL: nodeURL },
            json: true
        }
        registerNodes.push(reqPromise(requestOptions))
    })

    Promise.all(registerNodes)
        .then(data => {
            const bulkRegisterOptions = {
                uri: nodeURL + '/register-bulk-nodes',
                method: 'POST',
                body: { networkNodes: [...BelayChain.networkNodes, BelayChain.nodeUrl] },
                json: true
            }

            return reqPromise(bulkRegisterOptions)
        }).then(data => {
            res.json(
                { message: 'A node registered with network successfully!'}
            )
        })
})



app.get('/blockchain', function (req, res) {
    res.send(BelayChain)
})

app.post('/certification', function (req, res) {
    const data = {
        gym_id: req.body.gym_id,
        user_member_number: req.body.user_member_number,
        cert_type: req.body.cert_type
    }
    const newCertificate = BelayChain.addBlock(data)
    res.send(newCertificate)
})

app.get('/gym', function (req, res) {
    const gymCertifications = BelayChain.findAllGymBlocks(req.body.gym_id)
    res.send(gymCertifications)
})

app.get('/member', function (req, res) {
    const memberCertifications = BelayChain.findAllMemberBlocks(
        req.body.user_member_number, req.body.gym_id
    )
    res.send(memberCertifications)
})

app.listen(port, () => console.log(`running on ${port}`))