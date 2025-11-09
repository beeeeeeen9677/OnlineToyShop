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

export { createNewUser };
