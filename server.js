const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(express.json());

// Đường dẫn tới file JSON
const dataPath = path.join(__dirname, "data", "transactions.json");

// Hàm đọc dữ liệu
function readTransactions() {
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
}

// Hàm ghi dữ liệu
function writeTransactions(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Tạo transaction_id ngẫu nhiên
function generateTransactionId() {
  return "TX" + Date.now();
}

/*
  ===========================
  POST /create_payment
  ===========================
*/
app.post("/create_payment", (req, res) => {
  const { order_id, amount, method } = req.body;

  // Validation đơn giản
  if (!order_id || !amount || !method) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      error: "Amount must be greater than 0"
    });
  }

  const transaction_id = generateTransactionId();

  const newTransaction = {
    transaction_id,
    order_id,
    amount,
    method,
    status: "CREATED",
    created_at: new Date().toISOString()
  };

  const transactions = readTransactions();
  transactions.push(newTransaction);
  writeTransactions(transactions);

  const payment_url = `http://localhost:${PORT}/pay/${transaction_id}`;

  res.json({
    transaction_id,
    payment_url,
    status: "CREATED"
  });
});

/*
  ===========================
  GET /pay/:transaction_id
  ===========================
*/
app.get("/pay/:transaction_id", (req, res) => {
  const { transaction_id } = req.params;

  const transactions = readTransactions();
  const transaction = transactions.find(
    t => t.transaction_id === transaction_id
  );

  if (!transaction) {
    return res.status(404).send("Transaction not found");
  }

  res.send(`
    <h1>Payment Gateway</h1>
    <p>Bạn đang thanh toán cho giao dịch: <b>${transaction.transaction_id}</b></p>
    <p>Order ID: ${transaction.order_id}</p>
    <p>Amount: ${transaction.amount}</p>
    <p>Method: ${transaction.method}</p>
    <p>Status: ${transaction.status}</p>
  `);
});

app.listen(PORT, () => {
  console.log(`Payment Gateway running on port ${PORT}`);
});
