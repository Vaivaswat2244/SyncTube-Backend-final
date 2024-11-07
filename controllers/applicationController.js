const Application = require('../models/application');
const Project = require('../models/project');
const User = require('../models/Users');
const mongoose = require('mongoose');

class ApplicationController {
  // Create a new application
  async createApplication(req, res) {
    try {
      const project_id = req.body.project_id;
      const editor_mail = req.user.email;


      // Validate if project exists
      const project = await Project.findOne({ project_id: project_id });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Validate if editor exists and is actually an editor
      const editor = await User.findOne({ email: editor_mail });
      if (!editor) {
        return res.status(404).json({ message: 'Editor not found' });
      }

      // Create application with youtuber_id from project
      const application = new Application({
        project_id,
        editor: editor_mail,
        youtuber: project.youtuber,
        status: 'pending'
      });

      await application.save();

      return res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: 'You have already applied to this project'
        });
      }
      return res.status(500).json({
        message: 'Error creating application',
        error: error.message
      });
    }
  }

  // Get applications by project
  async getProjectApplications(req, res) {
    try {
      const project_id  = req.body.project_id;
      const applications = await Application.find({ project_id })
      
      return res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error fetching applications',
        error: error.message
      });
    }
  }

  // Get applications by editor
  async getEditorApplications(req, res) {
    try {
      const { editor_id } = req.params;
      const applications = await Application.find({ editor_id })
        .populate('project_id', 'title description')
        .populate('youtuber_id', 'name channelName youtuber_Image')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error fetching applications',
        error: error.message
      });
    }
  }

  async rejectApplication(req, res){
    try {
      const { applicationId } = req.params;
  
      // Find the application
      const application = await Application.findById(applicationId);
  
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
  
      // Delete the application
      await application.deleteOne();
  
      return res.status(200).json({ message: 'Application rejected' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  async acceptApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { editor } = req.body;
      const application = await Application.findById(applicationId);
      
  
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const project = await Project.findOne({ project_id: application.project_id });
      
  
      if (!project) {
        
        return res.status(404).json({ error: 'Project not found' });
      }
  
      // Assign the editor to the project
      project.videoEditor = editor;
      project.status = 'in-progress';
      await project.save();
      
  
      // Delete the application
     
      await application.deleteOne();
      
  
      return res.status(200).json({ message: 'Application accepted' });
    } catch (error) {
      console.error('Error in acceptApplication:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ApplicationController();