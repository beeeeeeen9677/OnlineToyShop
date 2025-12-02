import User from "../models/User.js";
import Good from "../models/Good.js";

// Get user's cart with populated good details
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
      .populate("cart.goodId")
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter out any cart items where the good no longer exists
    const validItems = user.cart.filter((item) => item.goodId !== null);

    res.json({ items: validItems });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add item to cart or update quantity if exists
export const addToCart = async (req, res) => {
  try {
    const { goodId, quantity } = req.body;
    const userId = req.session.user._id;

    if (!goodId || !quantity) {
      return res
        .status(400)
        .json({ error: "goodId and quantity are required" });
    }

    if (quantity < 1 || quantity > 3) {
      return res
        .status(400)
        .json({ error: "Quantity must be between 1 and 3" });
    }

    // Verify the good exists
    const good = await Good.findById(goodId).lean().exec();
    if (!good) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if item already in cart
    const user = await User.findById(userId).exec();
    const existingItemIndex = user.cart.findIndex(
      (item) => item.goodId.toString() === goodId
    );

    if (existingItemIndex > -1) {
      // Update quantity (cap at 3)
      const newQuantity = Math.min(
        user.cart[existingItemIndex].quantity + quantity,
        3
      );
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({ goodId, quantity });
    }

    await user.save();

    // Return updated cart with populated goods
    const updatedUser = await User.findById(userId)
      .populate("cart.goodId")
      .lean()
      .exec();

    res.json({ items: updatedUser.cart });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { goodId } = req.params;
    const { quantity } = req.body;
    const userId = req.session.user._id;

    if (quantity < 1 || quantity > 3) {
      return res
        .status(400)
        .json({ error: "Quantity must be between 1 and 3" });
    }

    const user = await User.findById(userId).exec();
    const itemIndex = user.cart.findIndex(
      (item) => item.goodId.toString() === goodId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not in cart" });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("cart.goodId")
      .lean()
      .exec();

    res.json({ items: updatedUser.cart });
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ error: err.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { goodId } = req.params;
    const userId = req.session.user._id;

    const user = await User.findById(userId).exec();
    user.cart = user.cart.filter((item) => item.goodId.toString() !== goodId);
    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("cart.goodId")
      .lean()
      .exec();

    res.json({ items: updatedUser.cart });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ error: err.message });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.session.user._id;

    await User.findByIdAndUpdate(userId, { cart: [] });

    res.json({ items: [] });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: err.message });
  }
};

// Sync local cart with database cart on login
// Merge strategy: combine items, cap quantity at 3
export const syncCart = async (req, res) => {
  try {
    const { localCart } = req.body; // Array of { goodId, quantity }
    const userId = req.session.user._id;

    if (!Array.isArray(localCart)) {
      return res.status(400).json({ error: "localCart must be an array" });
    }

    const user = await User.findById(userId).exec();

    // Create a map of existing cart items (from DB)
    const cartMap = new Map();
    user.cart.forEach((item) => {
      cartMap.set(item.goodId.toString(), item.quantity);
    });

    // Merge local cart items
    for (const localItem of localCart) {
      // Verify the good exists
      const good = await Good.findById(localItem.goodId).lean().exec();
      if (!good) continue; // Skip invalid items

      const existingQty = cartMap.get(localItem.goodId) || 0;
      const newQty = Math.min(existingQty + localItem.quantity, 3);
      cartMap.set(localItem.goodId, newQty);
    }

    // Convert map back to array
    user.cart = Array.from(cartMap.entries()).map(([goodId, quantity]) => ({
      goodId,
      quantity,
    }));

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate("cart.goodId")
      .lean()
      .exec();

    res.json({ items: updatedUser.cart });
  } catch (err) {
    console.error("Error syncing cart:", err);
    res.status(500).json({ error: err.message });
  }
};
