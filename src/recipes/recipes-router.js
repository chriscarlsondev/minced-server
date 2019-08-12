require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('../config')
const logger = require('../logger')
const RecipesService = require('./recipes-service')
const xss = require('xss')
const jsonParser = express.json()
const path = require('path')


const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption, {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.use(express.static('public'))


const recipesRouter = express.Router()

const serializeRecipe = recipe => ({
  id: recipe.id,
  title: xss(recipe.title),
  description: xss(recipe.description),
  servings: xss(recipe.servings),
  preptime: xss(recipe.preptime),
  cooktime: xss(recipe.cooktime),
  ingredients: xss(recipe.ingredients),
  instructions: xss(recipe.instructions),
  notes: xss(recipe.notes)
})

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
  .post(jsonParser, (req, res, next) => {
    // Write a route handler for POST /tasks that accepts a JSON object representing a task and adds it to the list of tasks after validation.
    const { title, description, servings, preptime, cooktime, ingredients, instructions, notes } = req.body
    const newRecipe = { title, description, servings, preptime, cooktime, ingredients, instructions, notes }

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

recipesRouter
  .route('/:recipe_id')
  .all((req, res, next) => {
    if(isNaN(parseInt(req.params.recipe_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` }
      })
    }
    RecipesService.getRecipeById(
      req.app.get('db'),
      req.params.recipe_id
    )
      .then(recipe => {
        if (!recipe) {
          return res.status(404).json({
            error: { message: `Recipe doesn't exist` }
          })
        }
        res.recipe = recipe
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeRecipe(res.recipe))
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, description, servings, preptime, cooktime, ingredients, instructions, notes } = req.body
    const updatedRecipe = { title, description, servings, preptime, cooktime, ingredients, instructions, notes }

    RecipesService.updateRecipe(req.app.get('db'), req.params.recipe_id, updatedRecipe)
      .then(result => {
        res.status(200).json(serializeRecipe(result[0]));
    }).catch(next)


  })
  .delete((req, res, next) => {
    RecipesService.deleteRecipe(req.app.get('db'), req.params.recipe_id)
      .then(
        res.status(204).end()
    ).catch(next)
  })

module.exports = recipesRouter