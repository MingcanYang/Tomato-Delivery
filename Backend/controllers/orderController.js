import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js";
import mongoose from "mongoose";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// config variables
const currency = "usd";
const deliveryCharge = 2;
// const frontend_URL = "http://localhost:5173";
const frontend_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const validStatuses = ["Food Processing", "Out for delivery", "Delivered"];
const orderExpiryMs = 60 * 1000;
const orderCleanupIntervalMs = 15 * 1000;

const isOrderExpired = (order) => {
    if (!order || order.payment) {
        return false;
    }

    return Date.now() - new Date(order.date).getTime() >= orderExpiryMs;
}

const markOrderPaid = async (order) => {
    await orderModel.findByIdAndUpdate(order._id, { payment: true });
    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
}

const expireOrderIfNeeded = async (order) => {
    if (!isOrderExpired(order)) {
        return false;
    }

    if (order.stripeSessionId) {
        try {
            const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

            if (session.payment_status === "paid") {
                await markOrderPaid(order);
                return false;
            }

            // Keep the order while the customer is still inside an active Stripe
            // checkout session. Deleting it here breaks the success redirect flow
            // because /verify can no longer find the order after payment completes.
            if (session.status === "open") {
                return false;
            }
        } catch (error) {
            console.log("Failed to check Stripe session for expired order", order._id.toString(), error.message);
        }
    }

    await orderModel.findByIdAndDelete(order._id);
    return true;
}

const cleanupExpiredOrders = async (filter = {}) => {
    const expiredOrders = await orderModel.find({
        ...filter,
        payment: false,
        date: { $lte: new Date(Date.now() - orderExpiryMs) },
    });

    let removedCount = 0;

    for (const order of expiredOrders) {
        const removed = await expireOrderIfNeeded(order);
        if (removed) {
            removedCount += 1;
        }
    }

    return removedCount;
}

const cleanupTimer = setInterval(() => {
    cleanupExpiredOrders().catch((error) => {
        console.log("Failed to cleanup expired orders", error.message);
    });
}, orderCleanupIntervalMs);

cleanupTimer.unref?.();

const normalizeOrderItems = async (items = []) => {
    const quantities = new Map();
    const itemSnapshots = new Map();

    for (const item of items) {
        const id = item._id || item.id || item.itemId;
        const quantity = Number(item.quantity);

        if (!id || !Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("Invalid order items");
        }

        quantities.set(id, (quantities.get(id) || 0) + quantity);
        itemSnapshots.set(id, item);
    }

    if (quantities.size === 0) {
        throw new Error("Cart is empty");
    }

    const ids = [...quantities.keys()];
    const usesDatabaseIds = ids.every((id) => mongoose.Types.ObjectId.isValid(id));

    if (!usesDatabaseIds) {
        return ids.map((id) => {
            const item = itemSnapshots.get(id);
            const price = Number(item.price);

            if (!item.name || !Number.isFinite(price) || price <= 0) {
                throw new Error("Invalid order items");
            }

            return {
                _id: id,
                name: item.name,
                description: item.description || "",
                price,
                image: item.image || "",
                category: item.category || "",
                quantity: quantities.get(id),
            }
        });
    }

    const foods = await foodModel.find({ _id: { $in: ids } });

    if (foods.length !== quantities.size) {
        throw new Error("One or more items are unavailable");
    }

    return foods.map((food) => ({
        _id: food._id.toString(),
        name: food.name,
        description: food.description,
        price: food.price,
        image: food.image,
        category: food.category,
        quantity: quantities.get(food._id.toString()),
    }));
}

// Placing User Order for Frontend
const placeOrder = async (req, res) => {

    try {
        await cleanupExpiredOrders({ userId: req.body.userId });

        const orderItems = await normalizeOrderItems(req.body.items);
        const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const amount = subtotal + deliveryCharge;

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: orderItems,
            amount,
            address: req.body.address,
        })
        await newOrder.save();

        const line_items = orderItems.map((item) => ({
            price_data: {
              currency,
              product_data: {
                name: item.name
              },
              unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
          }))

        line_items.push({
            price_data:{
                currency,
                product_data:{
                    name:"Delivery Charge"
                },
                unit_amount: Math.round(deliveryCharge * 100)
            },
            quantity:1
        })
        
          const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontend_URL}/verify?session_id={CHECKOUT_SESSION_ID}&canceled=true`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString(),
                userId: req.body.userId,
            },
          });

          await orderModel.findByIdAndUpdate(newOrder._id, { stripeSessionId: session.id });
      
          res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message || "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        await cleanupExpiredOrders();
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        await cleanupExpiredOrders({ userId: req.body.userId });
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    try {
        if (!validStatuses.includes(req.body.status)) {
            return res.json({ success: false, message: "Invalid status" })
        }

        const order = await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        if (!order) {
            return res.json({ success: false, message: "Order not found" })
        }

        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const {sessionId} = req.body;
    try {
        if (!sessionId) {
            return res.json({ success: false, message: "Missing session id" })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const orderId = session.metadata?.orderId;
        const order = await orderModel.findOne({ _id: orderId, stripeSessionId: session.id });

        if (!order) {
            return res.json({ success: false, message: "Order not found" })
        }

        if (session.payment_status === "paid") {
            await markOrderPaid(order);
            res.json({ success: true, message: "Paid" })
        }
        else if (await expireOrderIfNeeded(order)) {
            res.json({ success: false, message: "Order expired" })
        }
        else if (session.status === "open") {
            res.json({ success: false, message: "Payment still pending" })
        }
        else if (!order.payment) {
            await orderModel.findByIdAndDelete(order._id)
            res.json({ success: false, message: "Not Paid" })
        }
        else {
            res.json({ success: true, message: "Already Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Not Verified" })
    }

}

export { placeOrder, listOrders, userOrders, updateStatus ,verifyOrder }
