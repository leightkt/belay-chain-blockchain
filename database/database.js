const dotevn = require('dotenv')
dotevn.config()
const uri = `mongodb+srv://${process.env.DB_username}:${process.env.DB_password}@cluster0.f2gkp.mongodb.net/BelayChainNode1?retryWrites=true&w=majority`
const mongoose = require('mongoose')

module.exports = mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
                    .then(() => console.log("MONGODB CONNECTED"))
                    .catch(console.error)