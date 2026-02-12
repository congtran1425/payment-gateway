# 📌 Payment Gateway Sandbox (Node.js + Express)

## 1. Giới thiệu

Đây là server giả lập **Payment Gateway** phục vụ cho đồ án:

**"Phân tích kiến trúc dịch vụ Internet trong hệ thống Payment Gateway cho TMĐT"**

Hệ thống mô phỏng luồng cơ bản của một cổng thanh toán:

1. Merchant Website gửi yêu cầu tạo giao dịch  
2. Gateway tạo transaction  
3. Gateway trả về link thanh toán  
4. Người dùng mở link để xem trang thanh toán giả lập  

⚠ Đây là môi trường **Sandbox**, không xử lý tiền thật.

---

# 2. Kiến trúc hệ thống

## 2.1 Thành phần hệ thống

Hệ thống gồm 2 thành phần:

### 1️⃣ Merchant Website (giả lập TMĐT)

- Gửi yêu cầu thanh toán
- Nhận `payment_url`

### 2️⃣ Payment Gateway Service

- Tạo transaction
- Lưu transaction
- Cung cấp trang thanh toán

---

## 2.2 Sơ đồ luồng hoạt động

`[ Merchant Website ] || POST /create_payment`
`v`
`[ Payment Gateway Service ] || Trả về payment_url`
`v`
`[ Người dùng mở /pay/:transaction_id ]`    


---

# 3. Công nghệ sử dụng

| Thành phần        | Công nghệ       |
|------------------|----------------|
| Backend Server   | Node.js       |
| Web Framework    | Express       |
| Lưu trữ          | JSON file     |
| Test API         | Postman       |

---

# 4. Yêu cầu hệ thống

Để chạy được server, cần cài đặt:

## 4.1 Node.js

Tải tại:  

```bash 
https://nodejs.org
```
Sau khi cài đặt, kiểm tra:

```bash
node -v
npm -v
```
Nếu hiển thị version → cài đặt thành công.

## 4.2 Visual Studio Code (khuyến nghị)

Tải tại:

```bash
https://code.visualstudio.com
```
Extension khuyến nghị:

- Prettier

- REST Client

## 4.3 Postman (để test API)

Tải tại:

```bash
https://www.postman.com/downloads/
```
# 5. Cài đặt project
- Bước 1: Tạo thư mục project
```bash
mkdir payment-gateway
cd payment-gateway
```
- Bước 2: Khởi tạo Node project
```bash
npm init -y
```
- Bước 3: Cài đặt thư viện
```bash
npm install express
npm install --save-dev nodemon
```
- Bước 4: Cấu trúc thư mục
```bash
payment-gateway/
│
├── server.js
├── package.json
├── data/
│   └── transactions.json
```

Tạo file:
```bash
data/transactions.json
```

Nội dung ban đầu:
```bash
[]
```
- Bước 5: Cấu hình package.json
```bash
"main": "server.js",
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```
# 6. Khởi động server

Chạy:
```bash
npm run dev
```

Nếu thành công sẽ hiển thị:
```bash
Payment Gateway running on port 4000
```

Server chạy tại:
```bash
http://localhost:4000
```
# 7. API Documentation
7.1 Tạo giao dịch thanh toán
- Endpoint
```bash
POST /create_payment
```
- URL đầy đủ
```bash
http://localhost:4000/create_payment
```
```bash
Request Body (JSON)
{
  "order_id": "ORD001",
  "amount": 500000,
  "method": "CARD"
}
```
Ý nghĩa các trường
- Trường	Mô tả
order_id	Mã đơn hàng từ Merchant
amount	Số tiền thanh toán
method	Phương thức thanh toán
```bash
Response
{
  "transaction_id": "TX1700000000000",
  "payment_url": "http://localhost:4000/pay/TX1700000000000",
  "status": "CREATED"
}
```
Giải thích
Trường	Mô tả
transaction_id	Mã giao dịch duy nhất
payment_url	Link để người dùng thanh toán
status	Trạng thái ban đầu
# 8. Trang thanh toán giả lập
Endpoint
GET /pay/:transaction_id


Ví dụ:

http://localhost:4000/pay/TX1700000000000


Khi mở trên trình duyệt, sẽ hiển thị:

Transaction ID

Order ID

Amount

Method

Status

# 9. Cơ chế lưu trữ dữ liệu

Transaction được lưu vào file:

data/transactions.json


Ví dụ dữ liệu:

[
  {
    "transaction_id": "TX1700000000000",
    "order_id": "ORD001",
    "amount": 500000,
    "method": "CARD",
    "status": "CREATED",
    "created_at": "2026-02-13T10:20:00Z"
  }
]


Đây là cơ chế lưu trữ đơn giản phục vụ sandbox.

# 10. Lifecycle Transaction

Trong hệ thống, transaction có vòng đời:

CREATED → PENDING → SUCCESS
                    → FAILED


Hiện tại server mới implement:

CREATED

Các trạng thái khác có thể mở rộng sau.

# 11. Quy trình vận hành tổng thể
Bước 1: Khởi động server
npm run dev

Bước 2: Merchant gửi yêu cầu tạo thanh toán

Merchant gọi:

POST /create_payment


Gateway sẽ:

Validate dữ liệu

Tạo transaction_id

Lưu transaction

Trả về payment_url

Bước 3: Người dùng truy cập payment_url

Người dùng mở:

http://localhost:4000/pay/{transaction_id}


Gateway sẽ:

Tìm transaction

Hiển thị trang thanh toán

# 12. Đặc điểm kiến trúc

RESTful API

Stateless communication

Service độc lập

Tách biệt Merchant và Gateway

Resource-based design

JSON data format

# 13. Môi trường hoạt động

Environment: Sandbox

Không xử lý tiền thật

Không có webhook

Không có dashboard quản trị

# 14. Hướng phát triển tương lai

Thêm cập nhật trạng thái (SUCCESS / FAILED)

Thêm webhook callback cho Merchant

Thêm authentication (API Key)

Thêm dashboard quản lý transaction

Chuyển sang SQLite hoặc database thực

# 15. Kết luận

Hệ thống Payment Gateway Sandbox này mô phỏng:

Quy trình tạo giao dịch thanh toán

Cấp phát payment link

Tách biệt service theo mô hình dịch vụ Internet

Đây là nền tảng để phân tích kiến trúc dịch vụ trong hệ thống Payment Gateway cho thương mại điện tử.# payment-gateway
