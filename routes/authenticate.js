const jwt = require('jsonwebtoken')

function authenticate (request, response, next) {
    const secret = "BootsAndBuffaloSauce"
    const authHeader = request.get("Authorization")

    if (!authHeader) {
        response.json({ errors: "no token"})
    }

    const token = authHeader

    jwt.verify(token, secret, (error, payload) => {
        if(error) response.json({ errors: error.message })

        if(payload.id) {
            request.token_id = payload.id
            next()
        } else {
            response.json({ errors: "Invalid Token"})
        }
    })


}

module.exports = authenticate