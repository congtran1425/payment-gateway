const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 4000;

app.use(express.json());

const dataPath = path.join(__dirname, "data", "transactions.json");
const WEBHOOK_SECRET = "supersecretkey";

// ======================
// READ / WRITE JSON
// ======================
function readTransactions() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, "[]");
  }
  return JSON.parse(fs.readFileSync(dataPath));
}

function writeTransactions(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function generateTransactionId() {
  return "TX" + Date.now();
}

// ======================
// CREATE PAYMENT
// ======================
app.post("/create_payment", (req, res) => {
  const { order_id, amount, method } = req.body;

  if (!order_id || !amount || !method) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const transaction_id = generateTransactionId();

  const newTransaction = {
    transaction_id,
    order_id,
    amount,
    method,
    status: "CREATED",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const transactions = readTransactions();
  transactions.push(newTransaction);
  writeTransactions(transactions);

  console.log(`[Gateway] Created transaction ${transaction_id}`);

  res.json({
    transaction_id,
    payment_url: `http://localhost:${PORT}/pay/${transaction_id}`
  });
});

// ======================
// PAYMENT PAGE
// ======================
app.get("/pay/:id", (req, res) => {
  const { id } = req.params;

  res.send(`
    <h2>Payment Page</h2>
    <p>Transaction: ${id}</p>

    <button onclick="updateStatus('SUCCESS')">
      Thanh toán thành công
    </button>

    <button onclick="updateStatus('FAILED')">
      Thanh toán thất bại
    </button>

    <script>
      function updateStatus(status) {
        fetch("/update_status/${id}", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        })
        .then(res => res.json())
        .then(data => alert(data.message));
      }
    </script>
  `);
});

// ======================
// UPDATE STATUS + WEBHOOK
// ======================
app.post("/update_status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let transactions = readTransactions();
  const transaction = transactions.find(t => t.transaction_id === id);

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  transaction.status = status;
  transaction.updated_at = new Date().toISOString();
  writeTransactions(transactions);

  console.log(`[Gateway] Status updated: ${id} → ${status}`);

  sendWebhookWithRetry(id, status);

  res.json({ message: "Status updated" });
});

// ======================
// WEBHOOK RETRY
// ======================
async function sendWebhookWithRetry(id, status, attempt = 1) {
  try {
    console.log(`[Gateway] Sending webhook (attempt ${attempt})`);

    await axios.post("http://localhost:3000/webhook", {
      transaction_id: id,
      status: status
    }, {
      headers: {
        "x-signature": WEBHOOK_SECRET
      }
    });

    console.log("[Gateway] Webhook sent successfully");

  } catch (error) {
    console.log("[Gateway] Webhook failed");

    if (attempt < 3) {
      setTimeout(() => {
        sendWebhookWithRetry(id, status, attempt + 1);
      }, 5000);
    }
  }
}

app.listen(PORT, () => {
  console.log(`Payment Gateway running on port ${PORT}`);
});