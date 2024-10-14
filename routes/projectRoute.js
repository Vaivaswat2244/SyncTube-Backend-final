const express = require('express');
const multer = require('multer');
const ProjectController = require('../controllers/projectController');
const checkUser = require('../middleware/checkUser');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply checkUser middleware to all routes
router.use(checkUser);

router.post('/create', ProjectController.createProject);
router.post('/assign-editor', ProjectController.assignVideoEditor);
router.post('/upload-video', upload.single('video'), ProjectController.uploadVideo);
router.get('/:projectId/video/:videoId/stream', ProjectController.getVideoStream);

module.exports = router;