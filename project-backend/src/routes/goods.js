import express from "express";

const router = express.Router();

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

export default router;
