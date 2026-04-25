import express from 'express';
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';
const foodRouter = express.Router();

//Image Storage Engine: Saving Image to upload folder & rename it

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`);
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image uploads are allowed"));
        }
        cb(null, true);
    }
})

foodRouter.get("/list",listFood);
foodRouter.post("/add",adminAuth,upload.single('image'),addFood);
foodRouter.post("/update",adminAuth,upload.single('image'),updateFood);
foodRouter.post("/remove",adminAuth,removeFood);

export default foodRouter;
