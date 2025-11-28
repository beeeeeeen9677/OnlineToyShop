import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { supabase } from "../../../server.js";
import Good from "../models/Good.js";

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const HK_TIMEZONE = "Asia/Hong_Kong";

// Helper function to convert date fields to HK timezone
const convertGoodDatesToHK = (good) => ({
  ...good,
  createdAt: dayjs(good.createdAt)
    .tz(HK_TIMEZONE)
    .format("YYYY-MM-DDTHH:mm:ss"),
  preorderCloseDate: dayjs(good.preorderCloseDate)
    .tz(HK_TIMEZONE)
    .format("YYYY-MM-DDTHH:mm:ss"),
  shippingDate: dayjs(good.shippingDate)
    .tz(HK_TIMEZONE)
    .format("YYYY-MM-DDTHH:mm:ss"),
});

export const createNewGoods = async (req, res) => {
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
      quota,
      category,
    } = goodsData;

    const newGood = {
      name,
      preorderCloseDate,
      shippingDate,
      price,
      description,
      quota,
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

export const updateGoods = async (req, res) => {
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
      quota,
      category,
      available,
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
        quota,
        imageUrl,
        category: category || [], // Use empty array if no category provided
        available,
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

export const fetchGoods = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Fetch single product by ID
      const good = await Good.findById(id).lean().exec();
      if (!good) {
        return res.status(404).json({ error: `Product ${id} not found` });
      }
      res.json(convertGoodDatesToHK(good));
    } else {
      // Fetch all products
      const goods = await Good.find().lean().exec();
      if (!goods) {
        return res.status(404).json({ error: "No products found" });
      }
      res.json(goods.map(convertGoodDatesToHK));
    }
  } catch (err) {
    console.error("Error fetching goods:", err);
    res.status(500).json({ error: err.message });
  }
};
