const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware')
const adminMiddleware = require('../middlewares/admin-middleware.js')
const uploadMiddleware = require('../middlewares/upload-middleware.js')
const {uploadImageController, fetchImagesController, deleteImageController} = require('../controllers/image-controller.js')
//upload the image
router.post('/upload', authMiddleware, adminMiddleware, uploadMiddleware.single('image'),uploadImageController)
//to get all the images
router.get("/get",authMiddleware, fetchImagesController)
//delete image route
router.delete('/:id', authMiddleware, adminMiddleware, deleteImageController)

module.exports = router