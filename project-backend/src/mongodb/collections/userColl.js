import User from "../models/User.js";

const createNewUser = async (req, res) => {
  const { firstName, lastName, firebaseUID, email, gender, dateOfBirth, role } =
    req.body;

  const userData = {
    firstName,
    lastName,
    firebaseUID,
    email,
    gender,
    dateOfBirth,
    role,
  };

  try {
    const duplicate = await User.findOne({
      firebaseUID: userData.firebaseUID,
    }).exec();
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

const getUserByFirebaseUID = async (req, res) => {
  const { firebaseUID } = req.body;

  if (!firebaseUID) {
    return res.status(400).json({ error: "Firebase UID is required." });
  }
  try {
    const user = await User.findOne({
      firebaseUID: firebaseUID,
    }).exec();
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

export { createNewUser, getUserByFirebaseUID };
