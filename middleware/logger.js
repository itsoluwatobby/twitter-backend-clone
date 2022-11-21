const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises
const {format} = require('date-fns')
const {v4: uuid} = require('uuid')

const logger = async(logName, method) => {
  const date = `${format(new Date(), 'MMMM-dd-yyyy\tHH:mm:ss')}`
  const logEvent = `${date}\t${uuid()}\t${method}\n`
  try{
    (!fs.existsSync(path.join(__dirname, '..', 'log'))) && await fsPromises.mkdir(path.join(__dirname, '..', 'log'))
    await fsPromises.appendFile(path.join(__dirname, '..', 'log', logName), logEvent)
  }catch(error){
    console.log('unable to log request')
  }
}

exports.logEvents = (req, res, next) => {
  logger('reqLog.log', `${req.method}\t${req.url}\t${req.headers.origin}`)
  next()
}

exports.errorLog = (err, req, res, next) => {
  logger(`${err.name}:\t${err.message}`, 'errLog.log')
  res.sendFile(path.join(__dirname, '..', 'public', '404.html'))
  console.log(`${err.stack}`)
  next()
}

