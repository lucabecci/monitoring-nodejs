require("dotenv").config()

const express = require("express")
const morgan = require("morgan")
const client  = require("prom-client")

const app = express()
const register = new client.Registry()

register.setDefaultLabels({
    app: process.env.NAMESPACE
})

client.collectDefaultMetrics({register: register})

app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false, limit: "50mb" }))


app.use('/ops/status', function(req, res){
    return res.status(200).json({
        namespace: process.env.NAMESPACE,
        port: process.env.PORT,
        env: process.env.NODE_ENV
    })
})

app.get("/ops/metrics", async function(req, res){
    return res.end(await register.metrics())
})

app.listen(process.env.PORT, function(){
    console.log(`Server on port: ${process.env.PORT}`)
})