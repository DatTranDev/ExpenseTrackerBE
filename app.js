const express = require('express');
const mongoose = require('mongoose');
const app = express();
const http = require("http").createServer(app)
const serviceRoute = require('./route/service_route.js');
const userRoute = require('./route/user_route.js');
const iconRoute = require('./route/icon_route.js');
const categoryRoute = require('./route/category_route.js');
const walletRoute = require('./route/wallet_route.js');
const budgetRoute = require('./route/budget_route.js');
const requestRoute = require('./route/request_route.js');
const transactionRoute = require('./route/transaction_route.js');
const uploadRoute = require('./route/upload_route.js');
require("dotenv").config();


const port = process.env.PORT;
const api = process.env.API_URL;
const url = process.env.ATLAS_URL;

 
mongoose.connect(url).then(
    res =>{
        console.log("Connect mongoDB successfully");
        http.listen(port, ()=>{
                console.log("Listen and run at port: " + port)
        })
    }
).catch(
    err=>{
        console.log(err)
    }
)
//setting connect
app.use(express.json());
app.get("/ping", (req,res)=>{
    return res.status(200).json({
        message: "pong"
    })
})

app.use(`${api}/user`, userRoute);
app.use(`${api}/service`, serviceRoute);
app.use(`${api}/icon`, iconRoute);
app.use(`${api}/category`, categoryRoute);
app.use(`${api}/wallet`, walletRoute);
app.use(`${api}/budget`, budgetRoute);
app.use(`${api}/request`, requestRoute);
app.use(`${api}/transaction`, transactionRoute);
app.use(`${api}/upload`, uploadRoute);
