require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan')
const dbConfig = require('./config/dbConfig')();
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose');
const { accessTokenVerificationJWT } = require('./middleware/verifyJWT');
const PORT = process.env.PORT || 5500

app.use(cors(corsOptions))

app.use(helmet())
app.use(morgan('common'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.get('/public', (req, res) => {
   res.status(200).json({status: true, message: 'server up and running'})
})

//authentication route
app.use('/users', require('./router/authRoute'));
app.use(accessTokenVerificationJWT)
//user route
app.use('/api/users', require('./router/userRoute'))
//post route
app.use('/posts', require('./router/postRoutes'))

app.all('*', (req, res) => {
   res.status(404).json({ status: false, message: 'resource not found'})
})

mongoose.connection.once('open', () => {
   console.log('Database connected')
   app.listen(PORT, () => console.log(`server running on port - ${PORT}`))
})
