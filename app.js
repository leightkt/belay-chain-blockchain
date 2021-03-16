const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')


const port = process.env.PORT || 9000
const corsOptions = {
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE'
}

const app = express();
app.use( bodyParser.urlencoded({ extended: false}) )
app.use(bodyParser.json());
app.use( cors(corsOptions) )

const nodeAddress = 'JavaSampleApproach'

const Blockchain = require('./src/Blockchain')
const BelayChain = new Blockchain()


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