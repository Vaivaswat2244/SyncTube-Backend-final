const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/checkUser'); 

router.post('/create', 
  auth,
  upload.single('video'),
  ProjectController.createProject
);
router.post('/assign-editor', ProjectController.assignVideoEditor);
router.post('/upload-video', upload.single('video'), ProjectController.uploadVideo);
router.get('/:projectId/video/:videoId/stream', ProjectController.getVideoStream);

module.exports = router;