# Time Manager Project

This project is a **full-stack time manager application** built with **Vue.js (frontend)**, **Node.js (backend)**, **MariaDB**, and **Nginx** for production.

---

## 1️⃣ Prerequisites

* [Docker](https://www.docker.com/get-started) & Docker Compose installed
* [Node.js](https://nodejs.org/) (for running frontend in development)
* npm (comes with Node.js)

---

## 2️⃣ Running the Production Version

The production setup runs **4 Docker containers**:

* **db**: MariaDB database
* **backend**: Node.js API
* **frontend**: Vue.js built app served by Nginx
* **nginx**: reverse proxy for frontend and backend

### Steps:

1. Build and start containers:

```bash
docker compose up --build -d
```

2. Open your browser at:

```
http://localhost
```

3. The app is now running with:

* Frontend served by Nginx
* API calls routed via `/api` to the backend
* Database persisted in Docker volume

4. To stop containers:

```bash
docker compose down
```

---

## 3️⃣ Running the Development Version

In development, we run:

* **DB** and **backend** in Docker
* **Frontend** locally using Vite (hot reload enabled)

### Steps:

1. Start backend and database:

```bash
docker compose up -d db backend
```

2. Start frontend locally:

```bash
cd frontend
npm install
npm run dev
```

3. Open your browser at:

```
http://localhost:5173
```

* The frontend uses **Vite proxy** to forward `/api` calls to `http://localhost:3000`
* You can edit frontend files and see changes **instantly** without rebuilding Docker containers

4. To stop backend and database:

```bash
docker compose down
```

---

## 4️⃣ Notes

* All API requests use relative paths (`/api/...`) so the same frontend code works in **both dev and prod**.
* Database data is persisted in Docker volumes (`db_data`).
* The development setup does **not use Nginx**, so frontend hot reload works directly with Vite.
