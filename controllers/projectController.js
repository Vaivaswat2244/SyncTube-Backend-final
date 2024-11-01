const AWS = require('aws-sdk');
const Project = require('../models/project');

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.BUCKET_REGION
});

const s3 = new AWS.S3();

class ProjectController {
  //CReating a project and storing the linked s3 url in db
  static async createProject(req, res) {
    try {
      const { title, description, videoTitle } = req.body;
      
      // Authentication check
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const youtuber = req.user.user_id;
      
      // File validation
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Validate file size
      if (req.file.size > 100 * 1024 * 1024) { // 100MB
        return res.status(400).json({ error: 'File size exceeds limit (100MB)' });
      }

      const videoBuffer = req.file.buffer;
      const fileName = `${Date.now()}-${req.file.originalname}`;

      // Upload to S3
      const putObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: videoBuffer,
        ContentType: req.file.mimetype
      };

      const putObjectResult = await s3.putObject(putObjectParams).promise();
      const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileName}`;

      // Generate project_id

      // Create project
      const project = new Project({
        title,
        description,
        youtuber,
        rawVideos: [{
          title: videoTitle,
          s3Key: fileName,
          s3Url,
          isRaw: true,
          uploadedBy: youtuber
        }]
      });

      await project.save();
      
      res.status(201).json({ 
        message: 'Project created successfully with uploaded video', 
        project,
        s3ETag: putObjectResult.ETag
      });

    } catch (error) {
      console.error('Error creating project:', error);
      
      // More specific error handling
      if (error.code === 'NetworkingError') {
        return res.status(500).json({ error: 'Failed to upload to S3. Please try again.' });
      }
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Invalid project data' });
      }
      
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
  //This will be used after application is successfull and youtuber assigns this editor 
  static async assignVideoEditor(req, res) {
    try {
      const { projectId, videoEditorId } = req.body;
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check if the user is the youtuber of this project
      if (project.youtuber.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to assign editor to this project' });
      }

      project.videoEditor = videoEditorId;
      project.status = 'in-progress';
      await project.save();

      res.json({ message: 'Video editor assigned successfully', project });
    } catch (error) {
      console.error('Error assigning video editor:', error);
      res.status(500).json({ error: 'Failed to assign video editor' });
    }
  }

  static async uploadVideo(req, res) {
    try {
      const { projectId, title, isRaw } = req.body;
      const videoBuffer = req.file.buffer;
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check if the user is authorized to upload to this project
      if (isRaw && project.youtuber.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to upload raw videos to this project' });
      }
      if (!isRaw && project.videoEditor.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to upload edited videos to this project' });
      }

      const putObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: videoBuffer,
        ContentType: req.file.mimetype
      };

      const putObjectResult = await s3.putObject(putObjectParams).promise();

      const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileName}`;

      const videoData = {
        title,
        s3Key: fileName,
        s3Url,
        isRaw,
        uploadedBy: req.user.id
      };

      if (isRaw) {
        project.rawVideos.push(videoData);
      } else {
        project.editedVideos.push(videoData);
        project.status = 'review';
      }

      await project.save();

      res.status(201).json({ 
        message: 'Video uploaded successfully', 
        video: videoData,
        s3ETag: putObjectResult.ETag
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }

  static async getVideoStream(req, res) {
    try {
      const { projectId, videoId } = req.params;
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check if the user is authorized to access this project
      if (project.youtuber.toString() !== req.user.id && project.videoEditor.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to access videos in this project' });
      }

      const video = project.rawVideos.id(videoId) || project.editedVideos.id(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: video.s3Key
      };

      const s3Stream = s3.getObject(params).createReadStream();
      s3Stream.on('error', error => {
        console.error('Error streaming video:', error);
        res.status(500).json({ error: 'Failed to stream video' });
      });

      res.setHeader('Content-Type', 'video/mp4');
      s3Stream.pipe(res);
    } catch (error) {
      console.error('Error getting video stream:', error);
      res.status(500).json({ error: 'Failed to get video stream' });
    }
  }
}

module.exports = ProjectController;