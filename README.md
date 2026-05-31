# Invoice_Software

# Invoice Generating & Billing Software

A full-stack invoice management and billing software built with **Spring Boot, React, MySQL, JWT Authentication, PDF Generation, and Role-Based Access Control**.

This application helps businesses manage invoices, customers, products, payments, reports, overdue invoices, and company profile branding.

---

## Features

### Authentication & Authorization
- JWT-based login system
- Admin and Staff roles
- Role-based UI restrictions
- Backend-level role protection
- User management for admin
- Prevents admin from deleting their own account

### Dashboard
- Total invoice count
- Total revenue
- Total tax collected
- Pending amount
- Overdue amount
- Revenue trend chart
- Top customers chart
- Latest invoices table

### Invoice Management
- Create invoice
- Edit invoice
- Delete invoice
- Multiple invoice items
- Tax calculation
- Grand total calculation
- Paid amount and balance tracking
- Due date support
- Payment status: PAID, PARTIAL, UNPAID, OVERDUE
- View PDF before download
- Download invoice PDF

### Payment Management
- Mark payment
- Partial payment support
- Payment history
- Auto-update paid amount
- Auto-update balance amount
- Auto-update payment status

### Customer Master
- Add customers
- Edit customers
- Delete customers
- Select saved customer while creating invoice
- Auto-fill customer details

### Product Master
- Add products/services
- Edit products/services
- Delete products/services
- Select saved products while creating invoice
- Auto-fill product name and price

### Company Profile
- Save company name, address, phone, email, GST number
- Save bank details
- Save UPI ID
- Upload company logo
- Store logo in MySQL database
- Use company details and logo in invoice PDF

### Reports
- Revenue report
- Paid revenue report
- Pending amount report
- Date-wise revenue report
- Monthly revenue chart
- Payment status report
- Overdue invoice report
- CSV export
- Filter reports by date range and payment status

### Customer Statement
- Customer-wise invoice history
- Total billed
- Total paid
- Total pending
- Overdue amount
- Export customer statement as CSV

---

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL
- OpenPDF
- Maven

### Frontend
- React
- Vite
- Axios
- Recharts
- Lucide React
- React Hot Toast
- CSS

### Database
- MySQL

---

## Project Structure

```text
invoice-software/
├── backend/
│   ├── src/main/java/com/example/invoiceapp/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md


Default Login Accounts :

The application automatically creates default users on first startup.

Admin
Email: admin@gmail.com
Password: admin123
Role: ADMIN

Staff
Email: staff@gmail.com
Password: staff123
Role: STAFF

| Feature            | Admin | Staff |
| ------------------ | ----: | ----: |
| Dashboard          |   Yes |   Yes |
| Reports            |   Yes |   Yes |
| Customer Statement |   Yes |   Yes |
| Create Invoice     |   Yes |   Yes |
| View Invoice       |   Yes |   Yes |
| Download PDF       |   Yes |   Yes |
| Mark Payment       |   Yes |   Yes |
| Edit Invoice       |   Yes |    No |
| Delete Invoice     |   Yes |    No |
| Customer Master    |   Yes |    No |
| Product Master     |   Yes |    No |
| Company Profile    |   Yes |    No |
| User Management    |   Yes |    No |


Backend Setup

Go to the backend folder:

cd backend

Create a MySQL database:

CREATE DATABASE invoice_db;

Update database configuration in:

src/main/resources/application.properties

Example:

spring.datasource.url=jdbc:mysql://localhost:3306/invoice_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080

Run backend:

mvn spring-boot:run

Backend runs at:

http://localhost:8080
Frontend Setup

Go to the frontend folder:

cd frontend

Install dependencies:

npm install

Run frontend:

npm run dev

Frontend runs at:

http://localhost:5173
Production Build
Build React
cd frontend
npm run build

Copy the contents of:

frontend/dist/

to:

backend/src/main/resources/static/
Build Spring Boot JAR
cd backend
mvn clean package

Run the JAR:

java -jar target/*.jar

Open:

http://localhost:8080
API Modules
Authentication
POST /api/auth/login
POST /api/auth/register
Invoices
GET    /api/invoices
POST   /api/invoices
PUT    /api/invoices/{id}
DELETE /api/invoices/{id}
GET    /api/invoices/{id}/pdf
Customers
GET    /api/customers
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
Products
GET    /api/products
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
Payments
GET  /api/payments/invoice/{invoiceId}
POST /api/payments/invoice/{invoiceId}
Company Profile
GET  /api/company-profile
POST /api/company-profile
GET  /api/company-profile/logo
POST /api/company-profile/logo
Users
GET    /api/users
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
Screenshots

Add screenshots in the screenshots/ folder and update these links:

![Login](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Invoice List](screenshots/invoice-list.png)
![Reports](screenshots/reports.png)
![Invoice PDF](screenshots/invoice-pdf.png)
Future Enhancements
Email invoice to customer
WhatsApp invoice sharing
Backup and restore
Expense tracking
Profit/loss dashboard
Invoice number settings
Multi-company support
Cloud deployment
Author

Melbin George

GitHub: @melbingeorge17

License

This project is for learning, portfolio, and business software development practice.