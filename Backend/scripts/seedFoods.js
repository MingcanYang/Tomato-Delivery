import "dotenv/config";
import mongoose from "mongoose";
import foodModel from "../models/foodModel.js";

const description = "Food provides essential nutrients for overall health and well-being";

const foods = [
    { name: "Greek salad", image: "food_1.png", price: 12, description, category: "Salad" },
    { name: "Veg salad", image: "food_2.png", price: 18, description, category: "Salad" },
    { name: "Clover Salad", image: "food_3.png", price: 16, description, category: "Salad" },
    { name: "Chicken Salad", image: "food_4.png", price: 24, description, category: "Salad" },
    { name: "Lasagna Rolls", image: "food_5.png", price: 14, description, category: "Rolls" },
    { name: "Peri Peri Rolls", image: "food_6.png", price: 12, description, category: "Rolls" },
    { name: "Chicken Rolls", image: "food_7.png", price: 20, description, category: "Rolls" },
    { name: "Veg Rolls", image: "food_8.png", price: 15, description, category: "Rolls" },
    { name: "Ripple Ice Cream", image: "food_9.png", price: 14, description, category: "Deserts" },
    { name: "Fruit Ice Cream", image: "food_10.png", price: 22, description, category: "Deserts" },
    { name: "Jar Ice Cream", image: "food_11.png", price: 10, description, category: "Deserts" },
    { name: "Vanilla Ice Cream", image: "food_12.png", price: 12, description, category: "Deserts" },
    { name: "Chicken Sandwich", image: "food_13.png", price: 12, description, category: "Sandwich" },
    { name: "Vegan Sandwich", image: "food_14.png", price: 18, description, category: "Sandwich" },
    { name: "Grilled Sandwich", image: "food_15.png", price: 16, description, category: "Sandwich" },
    { name: "Bread Sandwich", image: "food_16.png", price: 24, description, category: "Sandwich" },
    { name: "Cup Cake", image: "food_17.png", price: 14, description, category: "Cake" },
    { name: "Vegan Cake", image: "food_18.png", price: 12, description, category: "Cake" },
    { name: "Butterscotch Cake", image: "food_19.png", price: 20, description, category: "Cake" },
    { name: "Sliced Cake", image: "food_20.png", price: 15, description, category: "Cake" },
    { name: "Garlic Mushroom", image: "food_21.png", price: 14, description, category: "Pure Veg" },
    { name: "Fried Cauliflower", image: "food_22.png", price: 22, description, category: "Pure Veg" },
    { name: "Mix Veg Pulao", image: "food_23.png", price: 10, description, category: "Pure Veg" },
    { name: "Rice Zucchini", image: "food_24.png", price: 12, description, category: "Pure Veg" },
    { name: "Cheese Pasta", image: "food_25.png", price: 12, description, category: "Pasta" },
    { name: "Tomato Pasta", image: "food_26.png", price: 18, description, category: "Pasta" },
    { name: "Creamy Pasta", image: "food_27.png", price: 16, description, category: "Pasta" },
    { name: "Chicken Pasta", image: "food_28.png", price: 24, description, category: "Pasta" },
    { name: "Buttter Noodles", image: "food_29.png", price: 14, description, category: "Noodles" },
    { name: "Veg Noodles", image: "food_30.png", price: 12, description, category: "Noodles" },
    { name: "Somen Noodles", image: "food_31.png", price: 20, description, category: "Noodles" },
    { name: "Cooked Noodles", image: "food_32.png", price: 15, description, category: "Noodles" },
];

const seedFoods = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    for (const food of foods) {
        await foodModel.findOneAndUpdate(
            { name: food.name },
            food,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    await mongoose.disconnect();
    console.log(`Seeded ${foods.length} foods`);
}

seedFoods().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
