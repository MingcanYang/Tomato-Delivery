import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";

const sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.json({ success: false, message: "Please provide name, email, and message." });
    }

    const newMessage = new messageModel({ name, email, message });
    await newMessage.save();

    res.json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Unable to send message." });
  }
};

const listMessages = async (req, res) => {
  try {
    const messages = await messageModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Unable to load messages." });
  }
};

const listUserMessages = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("email");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const messages = await messageModel.find({
      email: user.email,
      adminReply: { $exists: true, $ne: "" },
    }).sort({ repliedAt: -1, date: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Unable to load messages." });
  }
};

const replyMessage = async (req, res) => {
  try {
    const { messageId, adminReply } = req.body;

    if (!messageId || !adminReply?.trim()) {
      return res.json({ success: false, message: "Reply content is required." });
    }

    const message = await messageModel.findByIdAndUpdate(
      messageId,
      {
        adminReply: adminReply.trim(),
        repliedAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.json({ success: false, message: "Message not found." });
    }

    res.json({ success: true, message: "Reply sent.", data: message });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Unable to send reply." });
  }
};

export { sendMessage, listMessages, listUserMessages, replyMessage };
