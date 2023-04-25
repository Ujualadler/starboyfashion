const express = require ('express')
const app = express()

const dotenv=require("dotenv")
const morgan = require('morgan');
// app.use(morgan('dev'));
const mongoose= require('mongoose')
mongoose.set('strictQuery', false);

const nocache = require ('nocache')
app.use(nocache());
const path = require ('path')

app.use(express.static(path.join(__dirname, '/public')))
app.set ('view engine','ejs')

dotenv.config({ path:".env"})

/////////---database connection---/////////////////////

mongoose.connect(process.env.mongoDB,(err)=>{
    if (err)console.log(`unable to conect: ${err}`)
    else console.log('mongoDB connected');})


///////////////////---admin route---//////////////////////

const adminRoute = require ('./routes/adminRoute');

///////////////////---user route---//////////////////////

const userRoute = require ('./routes/userRoute');

const error_route=require('./routes/404')


app.use ('/', userRoute);
app.use ('/admin', adminRoute);
app.use('/',error_route)

// ----------------------------- server-------------------------------------



app.listen(process.env.PORT,()=>{
    console.log(`server listening on ${process.env.PORT}`)
})
