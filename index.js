require("dotenv").config()

const express = require("express")
const morgan = require("morgan")
const client  = require("prom-client")

const app = express()
const register = new client.Registry()


app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false, limit: "50mb" }))


register.setDefaultLabels({
    app: process.env.NAMESPACE
})

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

register.registerMetric(httpRequestDurationMicroseconds)

client.collectDefaultMetrics({register: register})

app.use(function(req, res, next){
    let end = httpRequestDurationMicroseconds.startTimer()
    res.on("finish", function(){  
        end({ 
            route: req.url,
            code: res.statusCode,
            method: req.method
        })
    }) 
    next()
})


app.get("/info", function(req, res){
    return res.status(200).json({message: "service of prom"})
})

app.get('/status', function(req, res){
    return res.status(200).json({
        namespace: process.env.NAMESPACE,
        port: process.env.PORT,
        env: process.env.NODE_ENV
    })
})

app.get("/metrics", async function(req, res){
    return res.status(200).end(await register.metrics())
})

app.listen(process.env.PORT, function(){
    console.log(`Server on port: ${process.env.PORT}`)
})