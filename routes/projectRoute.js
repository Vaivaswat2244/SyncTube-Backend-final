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
router.get('/getproject', auth, ProjectController.getYoutuberProjects);
router.get('/projects/:projectId', auth, ProjectController.getProjectById);
router.get('/getallproject', auth, ProjectController.getAllProjects );
router.post('/projects/upload-edited/:projectId', 
  auth,  // Your authentication middleware
  upload.single('video'),  // Multer middleware for file upload
  ProjectController.uploadEditedVideo
);
router.post('/assign-editor', ProjectController.assignVideoEditor);
router.post('/upload-video', upload.single('video'), ProjectController.uploadVideo);
router.get('/:projectId/video/:videoId/stream', ProjectController.getVideoStream);

module.exports = router;