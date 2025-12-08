import User from "../models/User.js";
import admin from "../../../server.js";

const createNewUser = async (req, res) => {
  const {
    firstName,
    lastName,
    firebaseUID,
    email,
    gender,
    dateOfBirth,
    role,
    profileComplete,
  } = req.body;

  const userData = {
    firstName,
    lastName,
    firebaseUID,
    email,
    gender,
    dateOfBirth,
    role,
    profileComplete: profileComplete !== undefined ? profileComplete : true, // Default true for regular registration
  };

  try {
    const duplicate = await User.findOne({
      firebaseUID: userData.firebaseUID,
    })
      .lean()
      .exec();
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "User with this Firebase UID already exists." });
    }

    // const newUser = new User(userData);
    // await newUser.save();
    const result = await User.create(userData);
    console.log("New user created:\n", result);
    res
      .status(201)
      .json({ message: "New user created successfully", user: result });
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).json({ message: error.message });
  }
};

// get user by firebase UID, also set user in session
const getUserByFirebaseUID = async (req, res) => {
  const { firebaseUID } = req.body;

  if (!firebaseUID) {
    return res.status(400).json({ error: "Firebase UID is required." });
  }
  try {
    const user = await User.findOne({
      firebaseUID: firebaseUID,
    })
      .lean()
      .exec();
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this Firebase UID not found." });
    }
    req.session.user = user;
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by Firebase UID:", error);
    res.status(500).json({ error: error.message });
  }
};

const getLimitedUserDataByID = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "User ID is required." });
  try {
    const user = await User.findOne({
      _id: id,
    })
      .select("_id firstName lastName role")
      .lean()
      .exec();
    if (!user) {
      return res
        .status(404)
        .json({ error: "User with this Firebase UID not found." });
    }

    const limitedUserData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.status(200).json(limitedUserData);
  } catch (error) {
    console.error("Error fetching user by Firebase UID:", error);
    res.status(500).json({ error: error.message });
  }
};

// for admin
const getUserByID = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "User ID is required." });
  try {
    const user = await User.findOne({ _id: id }).lean().exec();
    if (!user) {
      return res.status(404).json({ error: "User with this ID not found." });
    }

    const firebaseUser = await admin.auth().getUser(user.firebaseUID);
    user.emailVerified = firebaseUser.emailVerified;
    user.isPasswordProvider = firebaseUser.providerData.some(
      (provider) => provider.providerId === "password"
    );

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean().exec();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete user profile after OAuth registration
const completeProfile = async (req, res) => {
  const firebaseUID = req.firebaseUser.uid;
  const { firstName, lastName, gender, dateOfBirth } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !gender || !dateOfBirth) {
    return res.status(400).json({
      message:
        "All fields are required: firstName, lastName, gender, dateOfBirth",
    });
  }

  try {
    const user = await User.findOne({ firebaseUID }).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profileComplete) {
      return res.status(400).json({ message: "Profile already completed" });
    }

    // Update user with complete profile data
    user.firstName = firstName;
    user.lastName = lastName;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.profileComplete = true;

    await user.save();

    console.log("Profile completed for user:", user._id);
    res.status(200).json({
      message: "Profile completed successfully",
      user,
    });
  } catch (error) {
    console.error("Error completing profile:", error);
    res.status(500).json({ message: error.message });
  }
};

export {
  createNewUser,
  getUserByFirebaseUID,
  getLimitedUserDataByID,
  getUserByID,
  getAllUsers,
  completeProfile,
};
