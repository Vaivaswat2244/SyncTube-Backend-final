const User = require("../models/Users");

exports.getUsers = async (req, res) => {
  try {
    const { role, user_id } = req.query;

    let query = {};

    if (role) {
      query.role = role;
    }

    if (user_id) {
      query.user_id = user_id;
    }

    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
