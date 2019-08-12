const RecipesService = require('../src/recipes/recipes-service')
const knex = require('knex')

describe(`Recipes service object`, function () {
    let db
    let testRecipes = [
        {
            id: 5,
            title: 'test2',
            servings: '3',
            preptime: '5',
            cooktime: '10',
            ingredients: '1. applesauce',
            instructions: '1. take out of jar',
            notes: 'these are the notes'
        },
    ]
    before(() => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
    })
    before('clean the table', () => db.raw('TRUNCATE recipes'))
    after('disconnect from db', () => db.destroy())
    context(`Given recipes has no data`, () => {
        it(`getAllRecipes() resolves an empty array`, () => {
            return RecipesService.getAllRecipes(db)
        .then(actual => {
            expect(actual).to.eql([])
            })
        })
    })

    context(`Given recipes has data`, () => {
        beforeEach('clean the table', () => db.raw('TRUNCATE recipes'))
        beforeEach(() => {
            return db
                .into('recipes')
                .insert(testRecipes)
        })
        it(`insertRecipes() inserts a new recipe and resolves the new recipe with an 'id'`, () => {
            const newRecipe = {
                id: 6,
                title: 'test2',
                servings: '3',
                preptime: '5',
                cooktime: '10',
                ingredients: '1. applesauce',
                instructions: '1. take out of jar',
                notes: 'these are the notes'
            }
            return RecipesService.insertRecipe(db, newRecipe)
        })
    })

    context(`Given recipes has data`, () => {
        beforeEach('clean the table', () => db.raw('TRUNCATE recipes RESTART IDENTITY CASCADE'))
        beforeEach(() => {
            return db
            .into('recipes')
            .insert(testRecipes)
        })
        it(`updateRecipe() updates a recipe from the recipe table`, () => {
            const idOfRecipeToUpdate = 5
            return RecipesService.updateRecipe(db, idOfRecipeToUpdate)
                .then(() => RecipesService.getAllRecipes(db))
                .then(allRecipes => {
                    // copy the test notes array without the "deleted" note
                    expected = [
                        {
                            id: 5,
                            title: 'test2',
                            servings: '3',
                            preptime: '5',
                            cooktime: '10',
                            ingredients: '1. applesauce',
                            instructions: '1. take out of jar',
                            notes: 'these are the notes'
                        }
                    ]
                    expect(allRecipes).to.eql(expected)
                })
        })
    })

})