const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const connectDB = require("./config/db");


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());           

// Allow React Frontend
app.use(cors({
    origin: 'http://localhost:5173', // Vite
    credentials: true
}));


const dashboardRouter = require('./routes/dashboardRouter');
const assetRouter = require('./routes/assetRouter');

app.use('/api/dashboard', dashboardRouter);
app.use('/api/assets', assetRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // Session Store
// const store = new MongoDBStore({
//     uri: process.env.MONGO_URI,
//     collection: 'sessions'
// });

// app.use(
//     session({
//         secret: process.env.SESSION_SECRET,
//         resave: false,
//         saveUninitialized: true,
//         store: store,
//     })
// );
app.use((req,res)=>{
    console.log(req.url);
})
app.listen((process.env.PORT || 3000),()=>{
    console.log("Server running on port",process.env.PORT);
})
