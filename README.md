# ThinkFlow – Backend

ThinkFlow Backend powers the core functionality of the ThinkFlow writing and knowledge-sharing platform.  
It handles authentication, story management, drafts, publishing, responses, reactions, and search through a secure and scalable API.

---

## 🚀 Features

- **Authentication**
  - Google & GitHub OAuth (Firebase Auth)
  - Session-based authentication
- **User Management**
  - Auto user creation on first login
  - Profile storage in Firestore
- **Stories**
  - Create, edit, save drafts, and publish stories
- **Responses & Reactions**
  - Comments, claps, and engagement tracking
- **Tags & Search**
  - Tag-based story categorization
  - Search APIs
- **Secure API**
  - CORS enabled
  - Environment-based configs
- **Scalable Architecture**
  - Modular routes & handlers
  - Clean separation of concerns

---

## 🛠 Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** Firebase Firestore  
- **Authentication:** Firebase Admin SDK  
- **Sessions:** express-session  
- **Logging:** Morgan  

---

## 📁 Project Structure

```text
backend/
│── src/
│   ├── app.js
│   ├── handlers/
│   ├── routes/
│   ├── db/
│   └── config/
│── server.js
│── package.json
│── .env
