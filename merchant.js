const express = require("express");
const app = express();

app.use(express.json());

const WEBHOOK_SECRET = "supersecretkey";

app.post("/webhook", (req, res) => {

    const signature = req.headers["x-signature"];

    if (signature !== WEBHOOK_SECRET) {
        return res.status(401).send("Invalid signature");
    }

    const { transaction_id, status } = req.body;

    console.log(`[Merchant] Webhook received: ${transaction_id} → ${status}`);

    console.log("[Merchant] Updating transaction in system...");

    res.json({ message: "Webhook received" });
});

app.listen(3000, () => {
    console.log("Merchant running on port 3000");
});