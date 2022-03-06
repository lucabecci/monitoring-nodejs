require("dotenv").config()

const express = require("express")
const morgan = require("morgan")

const app = express()
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false, limit: "50mb" }))


app.use('/v1/status', function(req, res){
    return res.status(200).json({
        namespace: process.env.NAMESPACE,
        port: process.env.PORT,
        env: process.env.NODE_ENV
    })
})

app.listen(process.env.PORT, function(){
    console.log(`Server on port: ${process.env.PORT}`)
})