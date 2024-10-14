const { url } = require("inspector");
const mongoose = require("mongoose");
const YoutuberSchema = new mongoose.Schema(
  {
    user_id: String,
    name: String,
    email: String,
    vid_desc: String,
    channelName: String,
    past_xp: String,
    image: String,
    project_id: String,
  },
  {
    collection: "Youtuber",
  }
);
var Youtuber = mongoose.model("Youtuber", YoutuberSchema);

module.exports = Youtuber;
