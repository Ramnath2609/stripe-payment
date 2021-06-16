const express = require("express");
const cors = require("cors");
const uuid = require("uuid");
const app = express()
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_KEY);

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Works fine")
})

app.post("/payment", (req, res) => {
    const { product, token } = req.body;
    const idempotencyKey = uuid.v4();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    })
    .then(customer => {
        stripe.charges.create({
            amount: product.price *100,
            currency: "usd",
            customer: customer.id,
            receipt_email: token.email,
            description: product.name,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }
        }, { idempotencyKey })
    })
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err => {
        console.log(err)
    })
})

app.listen(3001, () => {
    console.log("listening on port 3000")
})