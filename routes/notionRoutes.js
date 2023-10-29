const express = require('express');
const router = express.Router();
const axios = require('axios');


const { createPages, updateData, getDataBase, getIds } = require('../controllers/notionService');
// const { getMongoData } = require('../controllers/ingredients');

router.route('/').get(createPages);
router.route('/:id').patch(updateData);
router.route('/database').get(getDataBase);
const Ingredient = require('../models/Ingredient');

// router.post('/getIds', async(req, res) => {
//     const data = await getIds(process.env.NOTION_DATABASE_ID, process.env.NOTION_API_KEY);
//     res.json(data);
// });
router.post('/getIds', async (req, res, next) => {
    try {
        const databaseId = req.body.databaseId || process.env.NOTION_DATABASE_ID;
        const authToken = req.body.authToken || process.env.NOTION_API_KEY;
        const data = await getIds(databaseId, authToken);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});


// this is going to be a button in notion that when clicked will make a call to my mongo database
// what I want it to do is go through my notion database, and on each iteration see if there is a corresponding mongo item
// if there is not, I want the function to update/delete the item from the mongo database, if there is I want it to continue
// to be more specific. Go through notion database and collect all mongo_IDs in an array
// then go through the mongo database, if there is a match to one of the items in the mongo_IDs array, continue, if there is not, delete the item

const getMongoData = (async () => {
    const ingredients = await Ingredient.find({});
    return ingredients;
});

// const deleteIngredient = asyncWrapper(async (req, res, next) => {
//     const {id: ingredientID} = req.params;
//     const ingredient = await Ingredient.findOneAndDelete( {_id: ingredientID} );
//     if(!ingredient){
//         return res.status(404).json({msg: `No ingredient with id: ${ingredientID}`}); // beware this line
//     }
//     res.status(200).json({ ingredient });
// });

// const deleteIngredient = (async () => {
//     const ingredient = await Ingredient.findOneAndDelete({ _id: ingredientID});
    
// })


router.post('/sync', async (req, res) => {
    try {
        const databaseId = req.body.databaseId || process.env.NOTION_DATABASE_ID;
        const authToken = req.body.authToken || process.env.NOTION_API_KEY;
        const mongoData = await getMongoData();
        const { results } = await getIds(databaseId, authToken);
        let notionMongoIds = results.map(result => result.properties.MONGO_ID.rich_text[0].text.content);
        const notionIdSet = new Set(notionMongoIds);
        for (const entry of mongoData) {
            if (!notionIdSet.has(entry._id.toString())) {
              // If the MongoDB entry's ID does not exist in Notion IDs, delete it.
              await Ingredient.findOneAndDelete({ _id: entry._id });
            }
          }

        console.log(mongoData)
        // console.log(notionData)
        res.status(200).send({mongoData, results})
    } catch(error) {
        console.error(error)
        res.status(500).send('sync failed')
    }
});
// module.exports = getMongoData;
module.exports = router;



// router.get('/get-notion-data', async (req, res) => {
//   const data = await getSomeData();
//   res.json(data);
// });

// router.post('/update-notion-data', async (req, res) => {
//   await updateSomeData(req.body);
//   res.json({ message: 'Data updated' });
// });

// no 2 

// The task of getting data from a MongoDB database and sending it to a Notion database involves several steps.
// First, you'd need to query the MongoDB database to retrieve the data you want. Once you have that data, you can then send it to Notion using the Notion API. Since you're using Mongoose for MongoDB, you'd typically use one of its methods to query your database.
// Here's how you might modify your getData function to first get data from MongoDB:

// const MyMongoModel = require('../models/MyMongoModel'); // Replace with your actual MongoDB model

// const getData = asyncWrapper(async(req, res) => {
//     // Step 1: Get data from MongoDB
//     const mongoData = await MyMongoModel.find();  // Adjust this query based on what you actually need
    
//     if (!mongoData) {
//         return res.status(404).json({ error: 'Data not found in MongoDB' });
//     }
    
//     // Step 2: Send data to Notion (or whatever you need to do with it)
//     // This is a placeholder. You would replace this with code that
//     // correctly updates your Notion database based on the structure of `mongoData`
//     const notionData = await notion.databases.create({
//         parent: {
//             database_id: "your-notion-database-id",  // Replace with your Notion database ID
//         },
//         properties: {
//             // ... fill in with the actual properties you want to set
//         }
//     });
    
//     // Step 3: Send response
//     res.status(200).json({ mongoData, notionData });
// });
