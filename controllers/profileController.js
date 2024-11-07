const User = require('../models/Users');
const sharp = require('sharp');


module.exports = {
    async updateProfile(req,res){
        try {
            const userEmail = req.user.email; // Get email from auth middleware
            
            // Get the existing user
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            let updateData = {};
            const role = user.role;
    
            if (role === 'youtuber') {
                updateData = {
                    youtuber_desc: req.body.description,
                    channelName: req.body.channelName
                };
    
                // Handle youtuber image
                if (req.file) {
                    const compressedImageBuffer = await sharp(req.file.buffer)
                        .resize(800, 800, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .jpeg({ quality: 80 })
                        .toBuffer();
    
                    updateData.youtuber_Image = {
                        data: compressedImageBuffer,
                        contentType: 'image/jpeg'
                    };
                }
            } 
            else if (role === 'editor') {
                updateData = {
                    editor_desc: req.body.description,
                    past_xp: req.body.past_xp,
                    portfolio_link: req.body.portfolio_link,
                    resume_link: req.body.resume_link
                };
    
                // Handle editor image
                if (req.file) {
                    const compressedImageBuffer = await sharp(req.file.buffer)
                        .resize(800, 800, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .jpeg({ quality: 80 })
                        .toBuffer();
    
                    updateData.editor_Image = {
                        data: compressedImageBuffer,
                        contentType: 'image/jpeg'
                    };
                }
            }
    
            // Update user in database
            const updatedUser = await User.findOneAndUpdate(
                { email: userEmail },
                { $set: updateData },
                { new: true, runValidators: true }
            );
    
            // Prepare response object
            const userResponse = {
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            };
    
            // Add role-specific data to response
            if (role === 'youtuber') {
                userResponse.youtuber_desc = updatedUser.youtuber_desc;
                userResponse.channelName = updatedUser.channelName;
                if (updatedUser.youtuber_Image?.data) {
                    userResponse.image = `data:${updatedUser.youtuber_Image.contentType};base64,${updatedUser.youtuber_Image.data.toString('base64')}`;
                }
            } else if (role === 'editor') {
                userResponse.editor_desc = updatedUser.editor_desc;
                userResponse.past_xp = updatedUser.past_xp;
                userResponse.portfolio_link = updatedUser.portfolio_link;
                userResponse.resume_link = updatedUser.resume_link;
                if (updatedUser.editor_Image?.data) {
                    userResponse.image = `data:${updatedUser.editor_Image.contentType};base64,${updatedUser.editor_Image.data.toString('base64')}`;
                }
            }
    
            res.status(200).json({
                message: "Profile updated successfully",
                user: userResponse
            });
    
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                message: "Error updating profile",
                error: error.message
            });
        }
    },
    async getProfile(req, res){
        try {
            const userEmail = req.user.email; // Get email from auth middleware
            const user = await User.findOne({ email: userEmail });
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const userResponse = {
                name: user.name,
                email: user.email,
                role: user.role
            };
    
            if (user.role === 'youtuber') {
                userResponse.youtuber_desc = user.youtuber_desc;
                userResponse.channelName = user.channelName;
                if (user.youtuber_Image?.data) {
                    userResponse.image = `data:${user.youtuber_Image.contentType};base64,${user.youtuber_Image.data.toString('base64')}`;
                }
            } else if (user.role === 'editor') {
                userResponse.editor_desc = user.editor_desc;
                userResponse.past_xp = user.past_xp;
                userResponse.portfolio_link = user.portfolio_link;
                userResponse.resume_link = user.resume_link;
                if (user.editor_Image?.data) {
                    userResponse.image = `data:${user.editor_Image.contentType};base64,${user.editor_Image.data.toString('base64')}`;
                }
            }
    
            res.status(200).json({
                user: userResponse
            });
    
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: "Error fetching profile" });
        }
    },
    async getProfilebymail(req,res){
        try {
            const {userEmail} = req.params; // Get email from params
            const user = await User.findOne({ email: userEmail });
            
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const userResponse = {
                name: user.name,
                email: user.email,
                role: user.role
            };
    
            if (user.role === 'youtuber') {
                userResponse.youtuber_desc = user.youtuber_desc;
                userResponse.channelName = user.channelName;
                if (user.youtuber_Image?.data) {
                    userResponse.image = `data:${user.youtuber_Image.contentType};base64,${user.youtuber_Image.data.toString('base64')}`;
                }
            } else if (user.role === 'editor') {
                userResponse.editor_desc = user.editor_desc;
                userResponse.past_xp = user.past_xp;
                userResponse.portfolio_link = user.portfolio_link;
                userResponse.resume_link = user.resume_link;
                if (user.editor_Image?.data) {
                    userResponse.image = `data:${user.editor_Image.contentType};base64,${user.editor_Image.data.toString('base64')}`;
                }
            }
    
            res.status(200).json({
                user: userResponse
            });
    
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: "Error fetching profile" });
        }
    }
}