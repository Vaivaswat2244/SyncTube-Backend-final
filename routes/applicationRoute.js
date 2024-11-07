const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const auth = require('../middleware/checkUser'); // Your authentication middleware

router.post('/createapplications', auth, ApplicationController.createApplication);
router.post('/applications/project', ApplicationController.getProjectApplications);
router.get('/applications/editor/:editor_id', auth, ApplicationController.getEditorApplications);
router.post('/applications/accept/:applicationId',  ApplicationController.acceptApplication);
router.get('/applications/reject/:applicationId',  ApplicationController.rejectApplication);

module.exports = router;