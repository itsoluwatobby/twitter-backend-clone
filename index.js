require('dotenv').config()
require('./config/dbConfig')();
const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const corsOptions = require('./config/corsOptions');
const mongoose = require('mongoose');
const { accessTokenVerificationJWT } = require('./middleware/verifyJWT');
const { logEvents, errorLog } = require('./middleware/logger');
const PORT = process.env.PORT || 5300

app.use(logEvents)

app.use(cors(corsOptions))

app.use(helmet())
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('common'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

//authentication route
app.use('/users', require('./router/authRoute'));
app.use(accessTokenVerificationJWT)

//user route
app.use('/users', require('./router/userRoute'))

//post route
app.use('/posts', require('./router/postRoutes'))

//comment route
app.use('/posts', require('./router/commentRoutes'))

app.all('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', '404.html'))
})

mongoose.connection.once('open', () => {
   console.log('Database connected')
   app.listen(PORT, () => console.log(`server running on port - ${PORT}`))
})
