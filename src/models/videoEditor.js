const { url } = require("inspector");
const mongoose = require("mongoose");
const VideoEditorSchema = new mongoose.Schema(
  {
    user_id: String,
    name: String,
    email: String,
    desc: String,
    past_xp: String,
    portfolio_link: String,
    resume: String,
    image: String,
    project_id: String,
  },
  {
    collection: "VideoEditor",
  }
);
var VideoEditor = mongoose.model("VideoEditor", VideoEditorSchema);

module.exports = VideoEditor;
