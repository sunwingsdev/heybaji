const express = require("express");
const { ObjectId } = require("mongodb");

const withdrawsApi = (withdrawsCollection, usersCollection) => {
  const router = express.Router();

  // Add a withdraw
  router.post("/", async (req, res) => {
    const withdrawInfo = req.body;
    withdrawInfo.status = "pending";
    withdrawInfo.createdAt = new Date();

    try {
      const user = await usersCollection.findOne({ _id: new ObjectId(withdrawInfo.userId) });
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      if (user.balance < withdrawInfo.amount) {
        return res.status(400).send({ message: "Insufficient balance." });
      }

      // Decrement the user's balance
      await usersCollection.updateOne(
        { _id: new ObjectId(withdrawInfo.userId) },
        { $inc: { balance: -withdrawInfo.amount } }
      );

      const result = await withdrawsCollection.insertOne(withdrawInfo);
      res.status(201).send(result);
    } catch (error) {
      console.error("Error adding withdraw:", error);
      res.status(500).send({ message: "Server error" });
    }
  });

  // Get all withdraws
  router.get("/", async (req, res) => {
    try {
      const result = await withdrawsCollection
        .aggregate([
          {
            $addFields: {
              userId: { $toObjectId: "$userId" },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              "userInfo.password": 0,
            },
          },
        ])
        .toArray();

      res.status(200).send(result);
    } catch (error) {
      console.error("Error fetching withdraws:", error);
      res.status(500).send({ message: "Failed to fetch withdraws" });
    }
  });

  // Update withdraw status
  router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    try {
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid withdraw ID" });
      }

      const withdraw = await withdrawsCollection.findOne({ _id: new ObjectId(id) });
      if (!withdraw) {
        return res.status(404).send({ message: "Withdraw not found" });
      }

      if (withdraw.status !== "pending") {
        return res.status(400).send({ message: "Can only update pending withdrawals" });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).send({ message: "Invalid status" });
      }

      if (status === "rejected" && !reason) {
        return res.status(400).send({ message: "Reason is required for rejection" });
      }

      const updateData = { status };
      if (reason) updateData.reason = reason;

      // If rejected, refund the amount to user balance
      if (status === "rejected") {
        const user = await usersCollection.findOne({ _id: new ObjectId(withdraw.userId) });
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        await usersCollection.updateOne(
          { _id: new ObjectId(withdraw.userId) },
          { $inc: { balance: withdraw.amount } }
        );
      }

      const result = await withdrawsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return res.status(400).send({ message: "No changes made" });
      }

      res.status(200).send(result);
    } catch (error) {
      console.error("Error updating withdraw:", error);
      res.status(500).send({ message: "Server error" });
    }
  });

  // Delete a withdraw
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid withdraw ID" });
      }

      const withdraw = await withdrawsCollection.findOne({ _id: new ObjectId(id) });
      if (!withdraw) {
        return res.status(404).send({ message: "Withdraw not found" });
      }

      if (withdraw.status !== "pending") {
        return res.status(400).send({ message: "Can only delete pending withdrawals" });
      }

      // Refund the amount to user balance
      const user = await usersCollection.findOne({ _id: new ObjectId(withdraw.userId) });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      await usersCollection.updateOne(
        { _id: new ObjectId(withdraw.userId) },
        { $inc: { balance: withdraw.amount } }
      );

      const result = await withdrawsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(400).send({ message: "No withdraw deleted" });
      }

      res.status(200).send(result);
    } catch (error) {
      console.error("Error deleting withdraw:", error);
      res.status(500).send({ message: "Server error" });
    }
  });

  return router;
};

module.exports = withdrawsApi;