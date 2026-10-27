require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID

var db, collection;

const url = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DATABASE || 'SavageDatabase'

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages/:id/vote', (req, res) => {
  const {id} = req.params
  const {vote} = req.body
  const counter = vote === 'up' ? 'thumbUp' : vote === 'down' ? 'thumbDown' : null

  if (!ObjectID.isValid(id) || !counter) {
    return res.status(400).send('A valid message ID and vote are required')
  }

  db.collection('messages').findOneAndUpdate(
    {_id: new ObjectID(id)},
    {$inc: {[counter]: 1}},
    {returnOriginal: false},
    (err, result) => {
      if (err) return res.status(500).send(err)
      if (!result.value) return res.status(404).send('Message not found')
      res.json(result.value)
    }
  )
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})

if (!url) {
  throw new Error('MONGODB_URI must be set before starting the server')
}

MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
  if (error) {
    throw error
  }

  db = client.db(dbName)
  app.listen(3000, () => {
    console.log(`Connected to "${dbName}" and listening on port 3000`)
  })
})
