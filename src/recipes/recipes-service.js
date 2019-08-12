const RecipesService = {
    getAllRecipes(knex){
        return knex('recipes').orderBy('title')
    },
    getRecipeById(db, recipe_id) {
        return db
          .from('recipes')
          .select('*')
          .where('recipes.id', recipe_id)
          .first()
      },
    insertRecipe(knex, newRecipe) {
        return knex
            .insert(newRecipe)
            .into('recipes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteRecipe(db, recipe_id) {
        return db('recipes')
          .where({'id': recipe_id})
          .delete()
      },
    updateRecipe(db, recipe_id, newRecipe) {
        return db('recipes')
          .where({id: recipe_id})
          .update(newRecipe, returning=true)
          .returning('*')
      }
}

module.exports = RecipesService