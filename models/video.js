const { url } = require("inspector");
const mongoose = require("mongoose");
const VideoSchema = new mongoose.Schema(
  {
    vid_id: String,
    vid_title: String,
    vid_desc: String,
    vid_thumbnail: String,
    vid_spec: String,
    tag: Boolean, //False for RAW.
    video_url: String,
  },
  {
    collection: "Videos",
  }
);
var Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
