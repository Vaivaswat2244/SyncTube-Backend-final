const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  video_id: {type: String},
  title: { type: String},
  s3Key: { type: String},
  s3Url: { type: String},
  isRaw: { type: Boolean, default: true },
  uploadedBy: { type: String},
  uploadedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  project_id: {type: String, unique: true},
  title: { type: String},
  description: { type: String },
  youtuber: { type: String},
  videoEditor: { type: String},
  specifications:{type: String},
  rawVideos: [videoSchema],
  editedVideos: [videoSchema],
  status: { type: String, enum: ['planning', 'in-progress', 'review', 'completed'], default: 'planning' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);