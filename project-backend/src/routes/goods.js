import express from "express";
import {
  fetchGoods,
  incrementViewCount,
  searchGoods,
} from "../mongodb/collections/goodsColl.js";

const router = express.Router();
router.get("/", fetchGoods); // fetch all
router.get("/search", searchGoods);
router.put("/:id/view", incrementViewCount); // Track view count
router.get("/:id", fetchGoods); // fettch by id

/*
//import Good from "../mongodb/models/Good.js";
// Move this func above the /:id route before use
router.get("/updateExisitingGoods", async (req, res) => {
  try {
    const result = await Good.updateMany(
      {}, // Empty filter to match all documents
      {
        $set: {
          description: { en: "$description", zh: "" },
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
export default router;
