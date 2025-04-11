<h1 align="center">🌾 Farmer's Social Network (FSN)</h1>

<p align="center">
  <img src="screenshots/Dashboard.png" width="800" alt="Farmer Dashboard" />
</p>

<p align="center">
  🚀 Empowering agriculture through technology: REST APIs, AI, and Real-Time Collaboration 💬
</p>

---

## 🧠 Abstract

Farmer’s Social Network (FSN) is a smart, scalable platform built to **modernize agriculture**. It connects **farmers, agronomists**, and **admins** through:

- 🌐 RESTful APIs powered by **Spring Boot**
- 📸 AI crop disease prediction using **CNN models**
- 💬 Real-time communication using **Socket.IO**
- 📽️ Short video uploads (reels)
- 🔒 Secure authentication and role-based access

> 💡 It’s not just a project. It’s a **digital ecosystem** for better farming.

---

## 🚧 Core Stack

| Layer        | Tech Used                          |
|-------------|-------------------------------------|
| 🖥️ Frontend | React.js + Material UI              |
| 🔙 Backend  | Spring Boot + MySQL (REST APIs)     |
| 💬 Chat     | Node.js + Express + MongoDB + Socket.IO |
| 🤖 AI Model | CNN (TensorFlow, Dockerized)        |
| 📦 DevOps   | Docker + XAMPP                      |

---

## 🔥 Main Focus

✅ **Spring Boot REST APIs** for all CRUD operations  
✅ **AI-Powered Crop Disease Prediction** from images  
✅ **Real-Time Chat** between users & agronomists via **WebSockets**  
✅ **Seamless Post, Comment, and Resource management**  
✅ **Role-based platform** for Admin, Farmer, and Agronomist

---

## 🎯 Roles and Functionalities

- 👨‍🌾 **Farmer**: Create posts, upload reels, consult agronomists, explore crop resources  
- 🧑‍🔬 **Agronomist**: Provide expertise, upload resource materials, answer queries  
- 🧑‍💼 **Admin**: Full control over posts, resources, users, and can broadcast messages

---

## 💻 Run the Project

```bash
# Spring Boot Backend
cd springboot-backend
./mvnw spring-boot:run

# React Frontend
cd main-frontend
npm install
npm start

# Node Chat Backend
cd chat-backend
npm install
node server.js
