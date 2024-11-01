const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    editor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    youtuber_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
}, {
    timestamps: true,
    collection: "Applications"
});

// Indexes
ApplicationSchema.index({ project_id: 1, status: 1 });
ApplicationSchema.index({ editor_id: 1, project_id: 1 }, { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } }
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;