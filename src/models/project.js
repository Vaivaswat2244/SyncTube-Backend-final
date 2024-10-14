const Users = require("./Users");
const { url } = require("inspector");
const mongoose = require("mongoose");
const ProjectSchema = new mongoose.Schema(
  {
    videoEditor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    project_id: String,
    project_name: String,
    project_desc: String,
    project_spec: String,
    vid_id: String,
    status: Boolean,
  },
  {
    collection: "Project",
  }
);
var Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
