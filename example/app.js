'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()

app.set('view engine', 'pug')
app.use(compression())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(awsServerlessExpressMiddleware.eventContext())

app.get('/', (req, res) => {
  res.render('index', {
    apiUrl: req.apiGateway ? `https://${req.apiGateway.event.headers.Host}/${req.apiGateway.event.requestContext.stage}` : 'http://localhost:3000'
  })
})

app.get('/sam', (req, res) => {
  res.sendFile(`${__dirname}/sam-logo.png`)
})

app.get('/users', (req, res) => {
  res.json(users)
})

const url = require('url');
const ErrorResponse = require('./dto/errorResponse');
const fetch = require('node-fetch');

function proxyByFetch(_config) {
    return function (req, res) {
        let newurl = `${_config.ES_HOST}/${_config.ES_INDEX}/_search?${(url.parse(req.url).query ? url.parse(req.url).query : '')}`;
        console.info(`proxy target is ${newurl}`);
        console.log(req.body);
        fetch(newurl, {
            method: 'POST',
            body:    JSON.stringify(req.body),
            headers: req.headers,
            timeout: _config.ES_TIMEOUT ? _config.ES_TIMEOUT : 5000
        })
            .then(res => res.json())
            .then(json => res.end(JSON.stringify(json)) /*res.json(json) todo not work for express but work for lambda*/)
            .catch(err => {
                console.warn(err);
                res.status(500).json(new ErrorResponse('Elastic search service is down, pls try later.',
                    [err]));
            });

    };
}

app.use('/search', proxyByFetch({
    "ES_HOST":"http://esearch.versentdev.com.au:9200",
    "ES_INDEX":"test-es-metadata-search"
}));

app.get('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  return res.json(user)
})

app.post('/users', (req, res) => {
  const user = {
    id: ++userIdCounter,
    name: req.body.name
  }
  users.push(user)
  res.status(201).json(user)
})

app.put('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  user.name = req.body.name
  res.json(user)
})

app.delete('/users/:userId', (req, res) => {
  const userIndex = getUserIndex(req.params.userId)

  if(userIndex === -1) return res.status(404).json({})

  users.splice(userIndex, 1)
  res.json(users)
})

const getUser = (userId) => users.find(u => u.id === parseInt(userId))
const getUserIndex = (userId) => users.findIndex(u => u.id === parseInt(userId))

// Ephemeral in-memory data store
const users = [{
  id: 1,
  name: 'Joe'
}, {
  id: 2,
  name: 'Jane'
}]
let userIdCounter = users.length

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

// Export your express server so you can import it in the lambda function.
module.exports = app
