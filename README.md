
---

# ✅ **Backend – README.md**

```markdown
# Modern Blog Platform – Backend

A secure and scalable backend built with **Node.js**, **Express**, and **MongoDB**.  
Provides a complete API for managing blog posts, including creation, updating, deletion, and image uploads via AWS.

---

## 🚀 Features
- RESTful API for posts  
- JWT-based authentication 
- MongoDB database with Mongoose  
- Image upload to cloudenary  
- Error handling & validation  
- Secure and modular architecture  
- Deployed online for production use  

---

## 🛠️ Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Auth** (optional)
- **Multer** (for file uploads)

---

## 📁 Project Structure

/src
-config
-controllers
-helpers
-middleware
-models
-routes

---

## ⚙️ Installation & Setup

```bash
# Clone the project
git clone https://github.com/abdessamademoussaif/M-Blog-Api
cd M-blog-Api

# Install dependencies
npm install
🔧 Environment Variables
Create a .env file:

PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY=xxx
AWS_SECRET_KEY=xxx
AWS_BUCKET_NAME=xxx
AWS_REGION=xxx

▶️ Run the Server
npm run dev

📦 Build for Production
npm start

📚 API Endpoints
Posts
Method	Endpoint	Description
GET	/api/posts	Get all posts
GET	/api/posts/:id	Get single post
POST	/api/posts	Create post
PUT	/api/posts/:id	Update post
DELETE	/api/posts/:id	Delete post

🤝 Contributing
Feel free to contribute by creating pull requests or opening issues.

📄 License
This project is licensed under the MIT License.
