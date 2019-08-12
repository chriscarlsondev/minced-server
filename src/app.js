require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const winston = require('winston');
const recipesRouter = require('./recipes/recipes-router')
const logger = require('./logger')
const express = require('express');

app = express()

app.use('/static', express.static('public'))

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
}))
  
app.use(cors());
// app.use(
//     cors({
//         origin: CLIENT_ORIGIN
//     })
// );

app.use(helmet())
app.use(express.json());
  
app.use('/api/recipes',recipesRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app