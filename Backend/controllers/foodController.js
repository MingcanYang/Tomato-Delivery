import foodModel from "../models/foodModel.js";
import fs from 'fs'

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add food
const addFood = async (req, res) => {

    if (!req.file) {
        return res.json({ success: false, message: "Image is required" })
    }

    const price = Number(req.body.price);
    if (!req.body.name || !req.body.description || !req.body.category || !Number.isFinite(price) || price <= 0) {
        return res.json({ success: false, message: "Invalid food data" })
    }

    let image_filename = `${req.file.filename}`

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price,
        category:req.body.category,
        image: image_filename,
    })
    try {
        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// update food
const updateFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" })
        }

        const price = Number(req.body.price);
        if (!req.body.name || !req.body.description || !req.body.category || !Number.isFinite(price) || price <= 0) {
            return res.json({ success: false, message: "Invalid food data" })
        }

        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price,
            category: req.body.category,
        };

        if (req.file) {
            fs.unlink(`uploads/${food.image}`, () => { })
            updateData.image = req.file.filename;
        }

        await foodModel.findByIdAndUpdate(req.body.id, updateData);
        res.json({ success: true, message: "Food Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" })
        }

        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

export { listFood, addFood, updateFood, removeFood }
