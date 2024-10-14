const User = require("../models/Users");

module.exports = {
  async getUsers(req, res) {
    try {
      const { role, user_id } = req.query;

      let query = {};

      if (role) {
        query.role = role;
      }

      if (user_id) {
        query._id = user_id;
      }

      const users = await User.find(query);
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  async createProfile(req, res) {
    try {
      const userId = req.locals.user_id;
      const {
        youtuber_desc,
        channelName,
        youtuber_Image,
        project_id,
        past_xp,
        editor_Desc,
        portfolio_link,
        resume,
        editor_Image,
      } = req.body;

      const user = await User.findById(userId);

      user.youtuber_desc = youtuber_desc;
      user.channelName = channelName;
      user.youtuber_Image = youtuber_Image;
      user.project_id = project_id;
      user.past_xp = past_xp;
      user.editor_Desc = editor_Desc;
      user.portfolio_link = portfolio_link;
      user.resume = resume;
      user.editor_Image = editor_Image;

      await user.save();

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
