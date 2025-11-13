import { supabase } from "../../../server.js";
import Good from "../models/Good.js";

export const createNewGood = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileBuffer = req.file.buffer;
    const fileName = Date.now() + "-" + req.file.originalname;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME) // Replace with your bucket name
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log("File uploaded to Supabase at URL");

    // Create new Good document in MongoDB
    const { name, preorderCloseDate, shippingDate, price, description, stock } =
      req.body;

    const newGood = {
      name,
      preorderCloseDate,
      shippingDate,
      price,
      description,
      stock,
      imageUrl: publicUrlData.publicUrl,
    };
    const result = await Good.create(newGood);

    res.json({
      message: "File uploaded successfully!",
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
