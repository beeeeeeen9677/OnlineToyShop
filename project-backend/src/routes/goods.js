import express from "express";
import { fetchGoods } from "../mongodb/collections/goodsColl.js";

const router = express.Router();
router.get("/", fetchGoods);
router.get("/:id", fetchGoods); // Same function handles both
export default router;

/*
router.get("/updateExisitingGoods", async (req, res) => {
  try {
    // Update all existing goods to add the new fields
    const result = await Good.updateMany(
      {}, // Empty filter to match all documents
      {
        $set: {
          viewedCount: 0,
          broughtCount: 0,
          createdAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "Successfully updated existing goods",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating existing goods:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
*/
