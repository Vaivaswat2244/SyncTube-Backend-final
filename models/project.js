const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  s3Key: { type: String, required: true },
  s3Url: { type: String, required: true },
  isRaw: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  youtuber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoEditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rawVideos: [videoSchema],
  editedVideos: [videoSchema],
  status: { type: String, enum: ['planning', 'in-progress', 'review', 'completed'], default: 'planning' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);