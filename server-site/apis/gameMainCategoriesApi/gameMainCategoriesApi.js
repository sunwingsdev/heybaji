const express = require("express");
const { ObjectId } = require("mongodb");
const { deleteFile } = require("../../utils");

const gameMainCategoriesApi = (gameMainCategoriesCollection) => {
  const router = express.Router();

  // Get all game main categories, sorted by order
  router.get("/", async (req, res) => {
    try {
      const gameMainCategories = await gameMainCategoriesCollection
        .find()
        .sort({ order: 1, createdAt: -1 })
        .toArray();
      res.send(gameMainCategories);
    } catch (err) {
      res.status(500).send({
        message: "Failed to fetch game main categories",
        error: err.message,
      });
    }
  });

  // Get category details
  router.get("/category-details", async (req, res) => {
    try {
      const categoryDetails = await gameMainCategoriesCollection
        .find({ isCategoryDetail: true })
        .toArray();
      res.send(categoryDetails);
    } catch (err) {
      res.status(500).send({
        message: "Failed to fetch category details",
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

  // Create a new category detail
  router.post("/category-details", async (req, res) => {
    try {
      const { category, gamePageBanner, gamePageBannerTitle, gamePageAmount } = req.body;

      if (!category) {
        return res.status(400).send({ message: "Category is required" });
      }

      const existingDetail = await gameMainCategoriesCollection.findOne({
        category: category.toUpperCase(),
        isCategoryDetail: true,
      });

      if (existingDetail) {
        return res.status(400).send({ message: "Category details already exist for this category" });
      }

      const detailData = {
        category: category.toUpperCase(),
        gamePageBanner: gamePageBanner || "",
        gamePageBannerTitle: gamePageBannerTitle || "",
        gamePageAmount: gamePageAmount || "",
        isCategoryDetail: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await gameMainCategoriesCollection.insertOne(detailData);
      res.status(201).send({ ...detailData, _id: result.insertedId });
    } catch (error) {
      res.status(500).send({
        message: "Failed to create category details",
        error: error.message,
      });
    }
  });

  // Update a category detail
  router.put("/category-details/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { category, gamePageBanner, gamePageBannerTitle, gamePageAmount, oldGamePageBanner } = req.body;

      console.log("oldGamePageBanner:", id);
      


      const existingDetail = await gameMainCategoriesCollection.findOne({
        _id: new ObjectId(id),
        isCategoryDetail: true,
      });

      if (!existingDetail) {
        return res.status(404).send({ message: "Category detail not found" });
      }

           
      

      if (oldGamePageBanner && gamePageBanner !== oldGamePageBanner) {
        try {
          await deleteFile(oldGamePageBanner);
        } catch (err) {
          console.error("Failed to delete old game page banner:", err);
        }
      }

      const updateData = {
        category: category.toUpperCase(),
        gamePageBanner: gamePageBanner || existingDetail.gamePageBanner,
        gamePageBannerTitle: gamePageBannerTitle || existingDetail.gamePageBannerTitle,
        gamePageAmount: gamePageAmount || existingDetail.gamePageAmount,
        isCategoryDetail: true,
        updatedAt: new Date(),
      };

       console.log("oldGamePageBanner updateData:", updateData);

      const result = await gameMainCategoriesCollection.findOneAndUpdate(
        { _id: new ObjectId(id), isCategoryDetail: true },
        { $set: updateData },
        { returnDocument: "after" }
      );

      res.send(result);
    } catch (error) {
      res.status(500).send({
        message: "Failed to update category details",
        error: error.message,
      });
    }
  });

  // Delete a category detail
  router.delete("/category-details/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const categoryDetail = await gameMainCategoriesCollection.findOne({
        _id: new ObjectId(id),
        isCategoryDetail: true,
      });

      if (!categoryDetail) {
        return res.status(404).send({ message: "Category detail not found" });
      }

      if (categoryDetail.gamePageBanner && categoryDetail.gamePageBanner !== "") {
        try {
          await deleteFile(categoryDetail.gamePageBanner);
        } catch (err) {
          console.error("Failed to delete game page banner:", err);
        }
      }

      await gameMainCategoriesCollection.deleteOne({
        _id: new ObjectId(id),
        isCategoryDetail: true,
      });
      res.send({ message: "Category detail deleted successfully" });
    } catch (error) {
      res.status(500).send({
        message: "Failed to delete category detail",
        error: error.message,
      });
    }
  });

  // Create a new game main category
  router.post("/", async (req, res) => {
    try {
      const { image, category, subcategory, submenuIcon } = req.body;

      // Validate required fields
      if (!category || !subcategory) {
        return res.status(400).send({ message: "Category and subcategory are required" });
      }

      // Find the highest order value
      const maxOrder = await gameMainCategoriesCollection
        .find()
        .sort({ order: -1 })
        .limit(1)
        .toArray();
      const newOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 1;

      const newCategory = {
        image: image || "",
        category: category || "CASINO",
        subcategory,
        submenuIcon: submenuIcon || "",
        order: newOrder,
        createdAt: new Date(),
      };

      const result = await gameMainCategoriesCollection.insertOne(newCategory);
      res.status(201).send({ ...newCategory, _id: result.insertedId });
    } catch (error) {
      res.status(500).send({
        message: "Failed to create game main category",
        error: error.message,
      });
    }
  });

  // Update a game main category
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const { image, category, subcategory, submenuIcon, oldImage, oldSubmenuIcon } = req.body;

      const existingCategory = await gameMainCategoriesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!existingCategory) {
        return res.status(404).send({ message: "Category not found" });
      }

      if (oldImage && image !== oldImage) {
        try {
          await deleteFile(oldImage);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      if (oldSubmenuIcon && submenuIcon !== oldSubmenuIcon) {
        try {
          await deleteFile(oldSubmenuIcon);
        } catch (err) {
          console.error("Failed to delete old submenu icon:", err);
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
        { returnDocument: "after" }
      );

      res.send(result);
    } catch (error) {
      res.status(500).send({
        message: "Failed to update game main category",
        error: error.message,
      });
    }
  });

  // Delete a game main category
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const category = await gameMainCategoriesCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!category) {
        return res.status(404).send({ message: "Category not found" });
      }

      if (category.image && category.image !== "") {
        try {
          await deleteFile(category.image);
        } catch (err) {
          console.error("Failed to delete image:", err);
        }
      }

      if (category.submenuIcon && category.submenuIcon !== "") {
        try {
          await deleteFile(category.submenuIcon);
        } catch (err) {
          console.error("Failed to delete submenu icon:", err);
        }
      }

      // Check if the category has associated details and delete the banner if exists
      const categoryDetail = await gameMainCategoriesCollection.findOne({
        category: category.category,
        isCategoryDetail: true,
      });

      if (categoryDetail && categoryDetail.gamePageBanner && categoryDetail.gamePageBanner !== "") {
        try {
          await deleteFile(categoryDetail.gamePageBanner);
        } catch (err) {
          console.error("Failed to delete game page banner:", err);
        }
      }

      await gameMainCategoriesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).send({
        message: "Failed to delete game main category",
        error: error.message,
      });
    }
  });

  router.post("/reorder", async (req, res) => {
    try {
      const categories = req.body.categories || req.body; // Handle both { categories: [...] } and [...]
      console.log("Received reorder request:", JSON.stringify(categories, null, 2));

      if (!Array.isArray(categories) || categories.length === 0) {
        console.error("Invalid categories data: Empty or not an array");
        return res.status(400).send({ message: "Invalid categories data" });
      }

      // Validate categories structure
      const invalidCategory = categories.find(
        (cat) => !cat.category || typeof cat.order !== "number" || cat.order < 1
      );
      if (invalidCategory) {
        console.error("Invalid category format:", JSON.stringify(invalidCategory, null, 2));
        return res.status(400).send({ message: "Invalid category format" });
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
        console.error("Duplicate order values:", orders);
        return res.status(400).send({ message: "Duplicate order values not allowed" });
      }

      // Check if categories exist in DB
      const categoryNames = normalizedCategories.map((cat) => cat.category);
      const existingCategories = await gameMainCategoriesCollection
        .find({ category: { $in: categoryNames } })
        .toArray();

      const existingCategoryNames = new Set(existingCategories.map((cat) => cat.category));
      const missingCategories = categoryNames.filter((name) => !existingCategoryNames.has(name));
      if (missingCategories.length > 0) {
        console.error("Missing categories in DB:", missingCategories);
        return res.status(400).send({
          message: `Categories not found: ${missingCategories.join(", ")}`,
        });
      }

      // Prepare bulk operations
      const bulkOps = normalizedCategories.map(({ category, order }) => ({
        updateMany: {
          filter: { category },
          update: { $set: { order } },
        },
      }));

      console.log("Executing bulkWrite with:", JSON.stringify(bulkOps, null, 2));
      const result = await gameMainCategoriesCollection.bulkWrite(bulkOps, { ordered: true });
      console.log("BulkWrite result:", JSON.stringify(result, null, 2));

      if (result.matchedCount === 0) {
        console.error("No documents matched for update");
        return res.status(400).send({ message: "No categories matched for update" });
      }

      res.send({ message: "Categories reordered successfully" });
    } catch (error) {
      console.error("Error in reorder:", error);
      res.status(500).send({
        message: "Failed to reorder categories",
        error: error.message,
      });
    }
  });

  return router;
};

module.exports = gameMainCategoriesApi;