const express = require('express')
const bodyParser = express.json()
const logger = require('../logger')
const RecipesService = require('./recipes-service')
const xss = require('xss')
const path = require('path')

const recipesRouter = express.Router()


recipesRouter
  .route('/')
  .get((req, res, next) => {
    // Write a route handler for the endpoint GET /tasks that returns a list of tasks
    RecipesService.getAllRecipes(req.app.get('db'))
    .then(tasks => {
      res.json(tasks)
    })
    .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
    // Write a route handler for POST /tasks that accepts a JSON object representing a task and adds it to the list of tasks after validation.
    const { title, servings, preptime, cooktime, ingredients, instructions, notes } = req.body
    const newRecipe = { title, servings, preptime, cooktime, ingredients, instructions, notes }

    if (newRecipe.title.length === 0) {
      logger.error(`Recipe title must be greater than zero`);
      return res.status(400).json({
        error: { message: `Invalid recipe title submitted` }
      })
    }


    RecipesService.insertRecipe(
        req.app.get('db'),
        newRecipe
    )
        .then(recipe => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
                .json(recipe)
        })
        .catch(next)
  })

module.exports = recipesRouter