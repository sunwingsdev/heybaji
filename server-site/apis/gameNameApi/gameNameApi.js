const express = require("express");
const { ObjectId } = require("mongodb");
const { deleteFile } = require("../../utils");

const gameNameApi = (gameNameCollection,homeControlsCollection) => {
  const router = express.Router();

  // Add a game
  router.post("/", async (req, res) => {
    try {
      const gameInfo = req.body;
      gameInfo.createdAt = new Date();
      gameInfo.isActive = gameInfo.isActive === true || gameInfo.isActive === "true";
      const result = await gameNameCollection.insertOne(gameInfo);
      const insertedGame = await gameNameCollection.findOne({
        _id: result.insertedId,
      });
      res.status(201).send(insertedGame);
    } catch (error) {
      res.status(500).send({ message: "Failed to add game", error });
    }
  });

  router.get("/game/category/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await gameNameCollection.findOne({ _id: new ObjectId(gameId) });
    if (!game) {
      return res.status(404).send({ message: "Game not found" });
    }
    res.send(game);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch game", error });
  }
});

  router.get("/games/subcategory/:subcategory", async (req, res) => {
    try {
      const { subcategory } = req.params;
      const games = await gameNameCollection
        .find({ subcategory: { $regex: `^${subcategory}$`, $options: 'i' } })
        .sort({ order: 1, createdAt: 1 })
        .toArray();

      res.status(200).send(games);
    } catch (error) {
      console.error("Error fetching games by subcategory:", error);
      res.status(500).send({ message: "Failed to to fetch games", error });
    }
  });

  // Update a game
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid game ID" });
      }

      const updatedData = req.body;
      updatedData.updatedAt = new Date();
      updatedData.isActive = updatedData.isActive === true || updatedData.isActive === "true";

      const result = await gameNameCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).send({ message: "Game not found" });
      }

      const updatedGame = await gameNameCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(updatedGame);
    } catch (error) {
      res.status(500).send({ message: "Failed to update game", error });
    }
  });

  // Get all games
  router.get("/", async (req, res) => {
    try {
      const games = await gameNameCollection.find().toArray();
      res.send(games);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch games", error });
    }
  });

  // Delete a game and its associated image
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid game ID" });
      }

      const game = await gameNameCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!game) {
        return res.status(404).send({ message: "Game not found" });
      }

      const result = await gameNameCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Game not found" });
      }

      if (game.image && game.image !== "/Uploads/images/default.png") {
        try {
          await deleteFile(game.image);
        } catch (err) {
          console.error("Error deleting image file:", err);
        }
      }

      res.send({ message: "Game and associated image deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete game", error });
    }
  });


    // Get a single game by gameId
  router.get("/game/featured/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await homeControlsCollection.findOne({ _id: new ObjectId(gameId) });

      if (!game) {
        return res.status(404).send({ message: "Game not found" });
      }

      res.send(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).send({ message: "Failed to fetch game", error });
    }
  });

    // Get a single game by gameId
  router.get("/game/category/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const game = await gameNameCollection.findOne({ _id: new ObjectId(gameId) });

      if (!game) {
        return res.status(404).send({ message: "Game not found" });
      }

      res.send(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).send({ message: "Failed to fetch game", error });
    }
  });



  return router;
};

module.exports = gameNameApi;