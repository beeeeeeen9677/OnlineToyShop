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

    // Parse the JSON data from FormData
    const goodsData = JSON.parse(req.body.data);
    //const { name, preorderCloseDate, shippingDate, price, description, stock } =
    const {
      name,
      preorderCloseDate,
      shippingDate,
      price,
      description,
      category,
    } = goodsData;

    const newGood = {
      name,
      preorderCloseDate,
      shippingDate,
      price,
      description,
      //stock,
      imageUrl: publicUrlData.publicUrl,
      category: category || [], // Use empty array if no category provided
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

export const updateGood = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the product exists
    const existingGood = await Good.findById(id).exec();
    if (!existingGood) {
      return res.status(404).json({ error: "Product not found" });
    }

    let imageUrl = existingGood.imageUrl; // Keep existing image by default

    // If a new file is uploaded, handle the image upload
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileName = Date.now() + "-" + req.file.originalname;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
      console.log("New file uploaded to Supabase");
    }

    // Parse the JSON data from FormData
    const goodsData = JSON.parse(req.body.data);
    const {
      name,
      preorderCloseDate,
      shippingDate,
      price,
      description,
      category,
    } = goodsData;

    // Update the product
    const updatedGood = await Good.findByIdAndUpdate(
      id,
      {
        name,
        preorderCloseDate,
        shippingDate,
        price,
        description,
        imageUrl,
        category: category || [], // Use empty array if no category provided
      },
      { new: true, runValidators: true } // Return updated document and run validation
    );

    res.json({
      message: "Product updated successfully!",
      result: updatedGood,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
};

export const fetchAllGoods = async (req, res) => {
  try {
    const goods = await Good.find().exec();
    res.json(goods); // Return array directly, not wrapped in object
  } catch (err) {
    console.error("Error fetching goods:", err);
    res.status(500).json({ error: err.message });
  }
};
