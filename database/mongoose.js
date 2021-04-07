const mongoose = require('mongoose')
const { Schema } = mongoose

const blockSchema = new Schema({
    index: Number,
    timestamp: Number,
    data: Object,
    previousHash: String,
    hash: String,
    nonce: Number
})

const nodeSchema = new Schema({
    nodeURL: String
})

const Block = mongoose.model('Block', blockSchema)
const Node = mongoose.model('Node', nodeSchema)

module.exports = {
    Block, 
    Node
}