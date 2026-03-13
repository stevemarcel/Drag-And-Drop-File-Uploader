# Shark Colours | File Uploader

This project is a high-performance, full-stack file sharing application designed for professional asset delivery. Built with **Node.js, Express, and MongoDB**, it features a secure **"Drag & Drop" interface that automates the lifecycle of shared files.** The application integrates with **Cloudinary (or Backblaze B2)** for storage and features an **automated "expiry" system** that self-cleans both the cloud storage and database records **every 8 days.**

The system is designed for developers and creators who need a **"WeTransfer" style workflow** with total control over branding, link duration, and administrative oversight.

---

## 🖥️ Live Functionality

The uploader generates "Clean URLs" for direct asset downloads, bypassing standard web previews to ensure a professional client experience.

[<kbd> <br> CHECK OUT LIVE DEMO <br> </kbd>][Link]

[Link]: https://drag-and-drop-uploader.onrender.com/ "CHECK OUT LIVE DEMO"

---

## 🔐 Key Features

- **Smart Drag-and-Drop:** Intuitive UI for uploading Images, Videos, PDFs, and ZIP files.
- **Admin Dashboard:** A live monitor of active links showing high-precision countdowns (Days/Hours/Minutes) until file expiry.
- **Automated Lifecycle:** Integrated "Grim Reaper" script that automatically deletes files from both the Cloud and MongoDB after 8 days.
- **Direct Download Logic:** One-click "Copy Link" features that generate direct-download URLs for clients.
- **Cloud-Native Storage:** Optimized for large asset handling with support for "Raw" file delivery (ZIP/RAR/7z).
- **Mobile-Optimized:** Fully responsive interface for managing and downloading assets on the go.

---

## 🧠 Technologies Used

- <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/mongodb-colored.svg"  height="15" alt="MongoDB" /></a>
  [**MongoDB & Mongoose**](https://www.mongodb.com/): Metadata storage and expiry tracking.
- <a href="https://expressjs.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/express-colored-dark.svg" height="15" alt="Express" /></a>
  [**Express**](https://expressjs.com/) **&** <a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/nodejs-colored.svg"  height="15" alt="NodeJS" /></a>
  [Node.js](https://nodejs.org/en/): Backend API and scheduled tasks.
- <a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/1/cloudinary-icon-ug0qqy8ms6ozyzy6cntbll.png/cloudinary-icon-hz05evx1htrghud89kpab4.png?_a=DATAiZAAZAA0"  height="15" alt="NodeJS" /></a>
  [**Cloudinary**](https://cloudinary.com/): Primary CDN and storage for raw assets.
- <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1638414369177/o1LpAHLyB.png" height="15" alt="Node-Cron" /></a>
  [**Node-Cron**](https://www.npmjs.com/package/node-cron): Automation engine for daily storage maintenance.
- <a href="https://axios-http.com/" target="_blank" rel="noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Font_Awesome_logomark_blue.svg" height="12" alt="Axios" /></a>
  [**Font Awesome**](https://fontawesome.com/): : Professional iconography for UI actions.
- <a href="https://jwt.io/" target="_blank" rel="noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" width="20" height="20" alt="JWT" /></a>
  **CSS3**: Custom responsive layouts without heavy frameworks.

---

## ⚙️ Installation

To run the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [YOUR_REPO_URL]
    ```

2.  Navigate to the project directory.
3.  **Install dependencies:**

    ```bash
    npm install
    npm install --prefix Frontend
    ```

4.  **Configure environment variables:** Create a `.env` file in the root directory (see variables below).
5.  **Start the server:**

    ```bash
    npm run start
    ```

---

## 📝 Environment Variables

| Variable                | Description                                   |
| :---------------------- | :-------------------------------------------- |
| `NODE_ENV`              | Environment mode (`development`/`production`) |
| `PORT`                  | Server port (default `5000`)                  |
| `MONGO_URI`             | **MongoDB** connection string                 |
| `ADMIN_ACCESS_KEY`      | Secret key used for `?auth=` URL protection   |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name                    |
| `CLOUDINARY_API_KEY`    | Your Cloudinary API Key                       |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API Secret                    |

**Note:** Replace placeholders with your own credentials. Never commit sensitive
data to version control.

## 🚀 Available Scripts

In the project root directory, you can run:

- `npm start`: Starts the **production** server.
- `npm run cleanup`: Manually triggers the expired-file removal script.

---

## 🌐 API Endpoints

| Method   | Endpoint         | Description                   | Access     |
| :------- | :--------------- | :---------------------------- | :--------- |
| `POST`   | `/api/uploads`   | Save Metadata                 | Admin Only |
| `GET`    | `/api/files/:id` | Get an uploaded file by ID    | Public     |
| `GET`    | `/api/files`     | Get all uploaded files        | Admin Only |
| `DELETE` | `/api/files/:id` | Delete an uploaded file by ID | Admin Only |

---

## 📁 Project Structure

```
file-uploader/
├── Frontend/            # Frontend Assets
│   ├── css/             # style.css & mobile.css
│   ├── js/              # script.js & download.js
│   ├── img/             # Shark Colours Branding
│   ├── download.html    # Download Page
│   └── index.html       # Admin Dashboard
├── Backend/
│   ├── config/          # Cloudinary & MongoDB Configuration
│   ├── controllers/     # File & Cleanup Logic
│   ├── models/          # Mongoose File Schema
│   ├── routes/          # API & Auth Routes
│   └── utils/           # node-cron Cleanup Scheduler
├── .env                 # Local Environment Keys
└── server.js            # Entry Point
```

---

## 🛡️ Security Considerations

- **URL Authentication:** The Admin dashboard is protected via an authKey system to prevent unauthorized uploads.
- **Storage Integrity:** The system uses `cloudinary.uploader.destroy` with `resource_type: "raw"` to ensure ZIP files are physically removed from the cloud, not just hidden from the DB.
- **Fail-Safe Cron:** Compatible with external ping services (like Cron-job.org) to ensure cleanup runs even if the server is in "sleep" mode.

---

## 🫱🏾‍🫲🏻 Contributors

- [Stephen Onyejuluwa](https://github.com/stevemarcel)

---

## 📜 License

This project is licensed under the
**[MIT License](https://opensource.org/licenses/MIT)**.

```

```
