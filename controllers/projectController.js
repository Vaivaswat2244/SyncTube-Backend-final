const AWS = require('aws-sdk');
const Project = require('../models/project');
const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');

const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});

const s3 = new AWS.S3();

class ProjectController {
  static async createProject(req, res) {
    try {
      const { title, description, specifications } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const youtuber = req.user.email;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }
      if (req.file.size > 100 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds limit (100MB)' });
      }

      const videoBuffer = req.file.buffer;
      const fileName = `${Date.now()}-${req.file.originalname}`;

      // Upload command
      const putCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: videoBuffer,
        ContentType: req.file.mimetype
      });
      
      // Upload the file
      await s3Client.send(putCommand);

      // Create a GetObject command for generating signed URL
      const getCommand = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
      });

      // Generate signed URL that expires in 1 hour
      const signedUrl = await getSignedUrl(s3Client, getCommand, { 
        expiresIn: 360000 
      });

      const video = {
        video_id: new mongoose.Types.ObjectId().toString(),
        title: fileName,
        s3Key: fileName,
        s3Url: signedUrl,
        isRaw: true,
        uploadedBy: youtuber
      };
      
      const project = new Project({
        project_id: new mongoose.Types.ObjectId().toString(),
        specifications,
        title,
        description,
        youtuber,
        rawVideos: [video]
      });
      
      await project.save();
      
      res.status(201).json({ 
        message: 'Project created successfully with uploaded video', 
        project
      });
    } catch (error) {
      console.error('Error creating project:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Invalid project data' });
      }
      
      res.status(500).json({ error: 'Failed to create project' });
    }
}

static async getYoutuberProjects(req, res) {
  try {
    const { email: youtuber } = req.user;
    const projects = await Project.find({ youtuber });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error getting YouTuber projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

static async getProjectById(req, res) {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { projectId } = req.params;
    
    // Find the project
    const project = await Project.findOne({ project_id: projectId });
    
    // If project doesn't exist
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project (either as youtuber or videoEditor)
    

    // Generate fresh signed URLs for all videos if they exist
    if (project.rawVideos && project.rawVideos.length > 0) {
      for (let video of project.rawVideos) {
        const getCommand = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: video.s3Key,
        });
        
        video.s3Url = await getSignedUrl(s3Client, getCommand, { 
          expiresIn: 360000 // 1 hour
        });
      }
    }

    if (project.editedVideos && project.editedVideos.length > 0) {
      for (let video of project.editedVideos) {
        const getCommand = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: video.s3Key,
        });
        
        video.s3Url = await getSignedUrl(s3Client, getCommand, { 
          expiresIn: 360000 // 1 hour
        });
      }
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

static async getAllProjects(req, res) {
  try {
    const projects = await Project.find({});
    
    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No projects found'
      });
    }

    return res.status(200).json({
      projects
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
}

static async uploadEditedVideo(req, res) {
  try {
      // Check authentication
      if (!req.user) {
          return res.status(401).json({ error: 'User not authenticated' });
      }

      const { projectId } = req.params;
      const editor = req.user.email;

      // Find the project and verify editor permission
      const project = await Project.findOne({ project_id: projectId });
      
      if (!project) {
          return res.status(404).json({ error: 'Project not found' });
      }

      // Check if the user is the assigned editor
      if (project.videoEditor !== editor) {
          return res.status(403).json({ error: 'You are not authorized to upload videos to this project' });
      }

      // Validate file upload
      if (!req.file) {
          return res.status(400).json({ error: 'No video file provided' });
      }
      if (req.file.size > 100 * 1024 * 1024) {
          return res.status(400).json({ error: 'File size exceeds limit (100MB)' });
      }

      const videoBuffer = req.file.buffer;
      const fileName = `edited-${Date.now()}-${req.file.originalname}`;

      // Upload to S3
      const putCommand = new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: videoBuffer,
          ContentType: req.file.mimetype
      });
      
      await s3Client.send(putCommand);

      // Generate signed URL
      const getCommand = new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
      });

      const signedUrl = await getSignedUrl(s3Client, getCommand, { 
          expiresIn: 360000 
      });

      // Create video object
      const video = {
          video_id: new mongoose.Types.ObjectId().toString(),
          title: fileName,
          s3Key: fileName,
          s3Url: signedUrl,
          isRaw: false,  // This is an edited video
          uploadedBy: editor
      };

      // Add video to project's editedVideos array
      project.editedVideos.push(video);
      
      // If this is the first edited video, update project status to 'review'
      if (project.editedVideos.length === 1) {
          project.status = 'review';
      }

      await project.save();

      res.status(200).json({
          message: 'Edited video uploaded successfully',
          video
      });

  } catch (error) {
      console.error('Error uploading edited video:', error);
      res.status(500).json({ error: 'Failed to upload edited video' });
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