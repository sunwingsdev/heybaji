const express = require("express");
const { ObjectId } = require('mongodb');
const { deleteFile } = require('../../utils');

const gameMainCategoriesApi = (gameMainCategoriesCollection) => {
  const router = express.Router();

  // Get all game main categories, sorted by order
  router.get('/', async (req, res) => {
    try {
      const gameMainCategories = await gameMainCategoriesCollection
        .find()
        .sort({ order: 1, createdAt: -1 })
        .toArray();
      res.send(gameMainCategories);
    } catch (err) {
      res.status(500).send({
        message: 'Failed to fetch game main categories',
        error: err.message,
      });
    }
  });



  router.get("/subcategory/:subCategoryName", async (req, res) => {
    try {
      const { subCategoryName } = req.params;
      const documents = await gameMainCategoriesCollection
        .find({ subcategory: { $regex: `^${subCategoryName}$`, $options: "i" } })
        .sort({ order: 1, createdAt: -1 })
        .toArray();

      if (documents.length === 0) {
        return res.status(404).send({ message: "Subcategory not found" });
      }

      const mainCategory = documents[0].category.toUpperCase();
      const relatedDocs = await gameMainCategoriesCollection
        .find({ category: mainCategory })
        .sort({ order: 1, createdAt: -1 })
        .toArray();

      const subcategories = [
        ...new Set(relatedDocs.map((doc) => doc.subcategory).filter(Boolean)),
      ].map((name) => ({ name }));

      res.send({
        mainCategory,
        subcategories,
      });
    } catch (error) {
      console.error("Error fetching subcategory data:", error);
      res.status(500).send({
        message: "Failed to fetch subcategory data",
        error: error.message,
      });
    }
  });

//   router.get('/subcategory/:subCategoryName', async (req, res) => {
//   try {
//     const { subCategoryName } = req.params;
//     // Find documents matching the subcategory (case-insensitive)
//     const documents = await gameMainCategoriesCollection
//       .find({ subcategory: { $regex: `^${subCategoryName}$`, $options: 'i' } })
//       .sort({ order: 1, createdAt: -1 })
//       .toArray();

//     if (documents.length === 0) {
//       return res.status(404).send({ message: 'Subcategory not found' });
//     }

//     // Get main category
//     const mainCategory = documents[0].category.toUpperCase();

//     // Get all subcategories for this main category
//     const relatedDocs = await gameMainCategoriesCollection
//       .find({ category: mainCategory })
//       .sort({ order: 1, createdAt: -1 })
//       .toArray();

//     // Group by subcategory
//     const subcategories = Object.values(
//       relatedDocs.reduce((acc, doc) => {
//         const subcatName = doc.subcategory;
//         if (subcatName) {
//           if (!acc[subcatName]) {
//             acc[subcatName] = {
//               name: subcatName,
//               games: [],
//             };
//           }
//           acc[subcatName].games.push({
//             _id: doc._id,
//             name: doc.subcategory, // Subcategory as game name
//             gameUrl: doc.gameUrl || 'https://placeholder.com/game',
//             category: doc.category,
//             subcategory: doc.subcategory,
//             provider: doc.provider || 'Unknown',
//             thumbnail: doc.submenuIcon || '/Uploads/images/default.png',
//             order: doc.order,
//           });
//         }
//         return acc;
//       }, {})
//     ).sort((a, b) => a.games[0].order - b.games[0].order || a.name.localeCompare(b.name));

//     res.send({
//       mainCategory,
//       subcategories,
//     });
//   } catch (error) {
//     console.error('Error fetching subcategory data:', error);
//     res.status(500).send({
//       message: 'Failed to fetch subcategory data',
//       error: error.message,
//     });
//   }
// });

// router.get('/subcategory/:subCategoryName', async (req, res) => {
//   try {
//     const { subCategoryName } = req.params;
//     const categoryDoc = await gameMainCategoriesCollection
//       .findOne({ subcategory: { $regex: `^${subCategoryName}$`, $options: 'i' } });
    
//     if (!categoryDoc) {
//       return res.status(404).send({ message: 'Subcategory not found' });
//     }

//     const mainCategory = categoryDoc.category.toUpperCase();
//     const subcats = await gameMainCategoriesCollection
//       .find({ category: mainCategory })
//       .distinct('subcategory');

//     const subcategories = await Promise.all(
//       subcats.map(async (subcat) => {
//         const games = await db.collection('games')
//           .find({ subcategory: { $regex: `^${subcat}$`, $options: 'i' } })
//           .sort({ order: 1, createdAt: -1 })
//           .toArray();
//         return {
//           name: subcat,
//           games,
//         };
//       })
//     );

//     res.send({
//       mainCategory,
//       subcategories: subcategories.sort((a, b) =>
//         a.games[0]?.order - b.games[0]?.order || a.name.localeCompare(b.name)
//       ),
//     });
//   } catch (error) {
//     console.error('Error fetching subcategory data:', error);
//     res.status(500).send({
//       message: 'Failed to fetch subcategory data',
//       error: error.message,
//     });
//   }
// });

//   router.get('/subcategory/:subCategoryName', async (req, res) => {
//   try {
//     const { subCategoryName } = req.params;
//     // Find documents matching the subcategory (case-insensitive)
//     const documents = await gameMainCategoriesCollection
//       .find({ subcategory: { $regex: `^${subCategoryName}$`, $options: 'i' } })
//       .sort({ order: 1, createdAt: -1 })
//       .toArray();

//     if (documents.length === 0) {
//       return res.status(404).send({ message: 'Subcategory not found' });
//     }

//     // Get main category (assume all documents for this subcategory share the same category)
//     const mainCategory = documents[0].category.toUpperCase();

//     // Get all subcategories for this main category
//     const relatedDocs = await gameMainCategoriesCollection
//       .find({ category: mainCategory })
//       .sort({ order: 1, createdAt: -1 })
//       .toArray();

//     // Group by subcategory
//     const subcategories = Object.values(
//       relatedDocs.reduce((acc, doc) => {
//         const subcatName = doc.subcategory;
//         if (subcatName) {
//           if (!acc[subcatName]) {
//             acc[subcatName] = {
//               name: subcatName,
//               games: [],
//             };
//           }
//           acc[subcatName].games.push({
//             _id: doc._id,
//             name: doc.subcategory, // Assuming subcategory name is the game name
//             gameUrl: doc.gameUrl || 'https://placeholder.com/game', // Adjust if gameUrl exists
//             category: doc.category,
//             subcategory: doc.subcategory,
//             provider: doc.provider || 'Unknown',
//             thumbnail: doc.submenuIcon || '/Uploads/images/default.png',
//             order: doc.order,
//           });
//         }
//         return acc;
//       }, {})
//     ).sort((a, b) => a.games[0].order - b.games[0].order || a.name.localeCompare(b.name));

//     res.send({
//       mainCategory,
//       subcategories,
//     });
//   } catch (error) {
//     console.error('Error fetching subcategory data:', error);
//     res.status(500).send({
//       message: 'Failed to fetch subcategory data',
//       error: error.message,
//     });
//   }
// });


  // Create a new game main category
  router.post('/', async (req, res) => {
    try {
      const { image, category, subcategory, submenuIcon } = req.body;

      // Validate required fields
      if (!category || !subcategory) {
        return res.status(400).send({ message: 'Category and subcategory are required' });
      }

      // Find the highest order value
      const maxOrder = await gameMainCategoriesCollection
        .find()
        .sort({ order: -1 })
        .limit(1)
        .toArray();
      const newOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 1;

      const newCategory = {
        image: image || '/Uploads/images/default.png',
        category: category || 'CASINO',
        subcategory: subcategory || '',
        submenuIcon: submenuIcon || '/Uploads/images/default.png',
        order: newOrder,
        createdAt: new Date(),
      };

      const result = await gameMainCategoriesCollection.insertOne(newCategory);
      res.status(201).send({ ...newCategory, _id: result.insertedId });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to create game main category',
        error: error.message,
      });
    }
  });

  // Update a game main category
  router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const { image, category, subcategory, submenuIcon, oldImage, oldSubmenuIcon } = req.body;

      const existingCategory = await gameMainCategoriesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!existingCategory) {
        return res.status(404).send({ message: 'Category not found' });
      }

      if (oldImage && image !== oldImage) {
        try {
          await deleteFile(oldImage);
        } catch (err) {
          console.error('Failed to delete old image:', err);
        }
      }

      if (oldSubmenuIcon && submenuIcon !== oldSubmenuIcon) {
        try {
          await deleteFile(oldSubmenuIcon);
        } catch (err) {
          console.error('Failed to delete old submenu icon:', err);
        }
      }

      const updateData = {
        image: image || existingCategory.image,
        category: category || existingCategory.category,
        subcategory: subcategory || existingCategory.subcategory,
        submenuIcon: submenuIcon || existingCategory.submenuIcon,
        updatedAt: new Date(),
      };

      const result = await gameMainCategoriesCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      res.send(result.value);
    } catch (error) {
      res.status(500).send({
        message: 'Failed to update game main category',
        error: error.message,
      });
    }
  });

  // Delete a game main category
  router.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const category = await gameMainCategoriesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!category) {
        return res.status(404).send({ message: 'Category not found' });
      }

      if (category.image && category.image !== '/Uploads/images/default.png') {
        try {
          await deleteFile(category.image);
        } catch (err) {
          console.error('Failed to delete image:', err);
        }
      }

      if (
        category.submenuIcon &&
        category.submenuIcon !== '/Uploads/images/default.png'
      ) {
        try {
          await deleteFile(category.submenuIcon);
        } catch (err) {
          console.error('Failed to delete submenu icon:', err);
        }
      }

      await gameMainCategoriesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to delete game main category',
        error: error.message,
      });
    }
  });

router.post('/reorder', async (req, res) => {
  try {
    const categories = req.body.categories || req.body; // Handle both { categories: [...] } and [...]
    console.log('Received reorder request:', JSON.stringify(categories, null, 2));

    if (!Array.isArray(categories) || categories.length === 0) {
      console.error('Invalid categories data: Empty or not an array');
      return res.status(400).send({ message: 'Invalid categories data' });
    }

    // Validate categories structure
    const invalidCategory = categories.find(
      (cat) => !cat.category || typeof cat.order !== 'number' || cat.order < 1
    );
    if (invalidCategory) {
      console.error('Invalid category format:', JSON.stringify(invalidCategory, null, 2));
      return res.status(400).send({ message: 'Invalid category format' });
    }

    // Normalize categories to uppercase
    const normalizedCategories = categories.map((cat) => ({
      category: cat.category.toUpperCase(),
      order: cat.order,
    }));

    // Check for duplicate orders
    const orders = normalizedCategories.map((cat) => cat.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      console.error('Duplicate order values:', orders);
      return res.status(400).send({ message: 'Duplicate order values not allowed' });
    }

    // Check if categories exist in DB
    const categoryNames = normalizedCategories.map((cat) => cat.category);
    const existingCategories = await gameMainCategoriesCollection
      .find({ category: { $in: categoryNames } })
      .toArray();

    const existingCategoryNames = new Set(existingCategories.map((cat) => cat.category));
    const missingCategories = categoryNames.filter((name) => !existingCategoryNames.has(name));
    if (missingCategories.length > 0) {
      console.error('Missing categories in DB:', missingCategories);
      return res.status(400).send({
        message: `Categories not found: ${missingCategories.join(', ')}`,
      });
    }

    // Prepare bulk operations
    const bulkOps = normalizedCategories.map(({ category, order }) => ({
      updateMany: {
        filter: { category },
        update: { $set: { order } },
      },
    }));

    console.log('Executing bulkWrite with:', JSON.stringify(bulkOps, null, 2));
    const result = await gameMainCategoriesCollection.bulkWrite(bulkOps, { ordered: true });
    console.log('BulkWrite result:', JSON.stringify(result, null, 2));

    if (result.matchedCount === 0) {
      console.error('No documents matched for update');
      return res.status(400).send({ message: 'No categories matched for update' });
    }

    res.send({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error in reorder:', error);
    res.status(500).send({
      message: 'Failed to reorder categories',
      error: error.message,
    });
  }
});
  return router;
};

module.exports = gameMainCategoriesApi;