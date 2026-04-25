const adminAuth = (req, res, next) => {
    const adminToken = process.env.ADMIN_TOKEN;
    const requestToken = req.headers["admin-token"];

    if (!adminToken) {
        return res.status(500).json({ success: false, message: "Admin token is not configured" });
    }

    if (requestToken !== adminToken) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }

    next();
}

export default adminAuth;
