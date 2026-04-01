const Image = require('../models/Image')
const { uploadToCloudinary } = require('../helpers/cloudinary-helpers')
const cloudinary = require('../config/cloudinary');
const fs = require('fs')
const uploadImageController = async(req,res)=>{
    try {
        //check if file is missing in req object
        if(!req.file){
            return res.status(400).json({
                success : false,
                message : 'File is required. Please upload an image'
            })
        }
        //upload to cloudinary
       const { url, publicId } = await uploadToCloudinary(req.file.path)

        //store the image url and public id along with the uploaded user id in the database
        const newlyCreatedImage = new Image({
            url,
            publicId,
            uploadedBy : req.userInfo.userId

        })
        await newlyCreatedImage.save();

        //delete the file from local storage
        fs.unlinkSync(req.file.path)
        res.status(201).json({
            success : true,
            message : 'Image uploaded successfully',
            image : newlyCreatedImage
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : 'Something went wrong! Please try again '
        })
    }
}



//fetching images controller
const fetchImagesController = async(req,res)=>{
    try {
        const page =parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page -1)*limit;


        const sortBy = req.query.sortBy || 'CreatedAt'
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = Image.countDocuments();
        const totalPages = Math.ceil(totalImages/ limit)
        const sortObj = {};
        sortObj[sortBy] = sortOrder;

        const images = (await Image.find()).sort(sortObj).skip(skip).limit(limit);
        if(images){
            res.status(200).json({
                success : true,
                currentPage : page,
                totalPages : totalPages,
                totalImages : totalImages,
                data : images
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Something went wrong! Please try again"
        })
    }
}


//delete image controller
const deleteImageController = async(req,res)=>{
   try {
     const getCurrentIdofImageToBeDeleted = req.params.id;
     const userId = req.userInfo.userId;

     const image = await Image.findById(getCurrentIdofImageToBeDeleted);
     if(!image){
        return res.status(404).json({
            success : false,
            message : "Image not found"
        })
     }

     //check if the current image is uploaded by the current user who is trying to delete this image
     if(image.uploadedBy.toString()!==userId){
        return res.status(403).json({
            success : false,
            message : "You are not authorized to delete this image because you are not the one who uploaded this image"

        })
     }
     
     //delete this image first from your cloudinary storage
     await cloudinary.uploader.destroy(image.publicId);

     //delete this image from mongoDB
     await Image.findByIdAndDelete(getCurrentIdofImageToBeDeleted)

     res.status(200).json({
        success : true,
        message : 'Image deleted successfully'
     })

   } catch (error) {
     console.log(error);
     res.status(500).json({
        success : false,
        message : "Something went wrong! Please try again"
     })
   }
}   




module.exports = {
    uploadImageController,
    fetchImagesController,
    deleteImageController
}