# MERN Tasks CRUD

A small MERN app with an Express API, MongoDB persistence, and a React single-page interface. The frontend reads and writes task data through the API; it does not connect to MongoDB directly.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

1. Install dependencies in both apps:

   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and set your MongoDB connection string and the URL where the React app runs:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/mern_tasks
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. Copy `frontend/.env.example` to `frontend/.env`. Set `VITE_API_URL` to the API's `/api` base URL:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the API in one terminal:

   ```sh
   cd backend
   npm run dev
   ```

5. Start the React app in another terminal:

   ```sh
   cd frontend
   npm run dev
   ```

6. Open the URL printed by Vite (usually `http://localhost:5173`). The backend's `CLIENT_URL` must match the frontend origin; the frontend sends API requests to `VITE_API_URL`.

## API

- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create a task (`title`, optional `description`)
- `PATCH /api/tasks/:id` — update a task (`title`, `description`, and/or `completed`)
- `DELETE /api/tasks/:id` — delete a task
- `GET /api/health` — check API and database status

## Tests and CI

Run the backend API integration tests against a dedicated MongoDB database whose name ends in `test` (for example, `mern_tasks_test`). The tests create and remove only their own task record:

```sh
cd backend
npm test
```

Set `MONGODB_URI` to that test database before running; the test refuses to run against a database without a test suffix.

GitHub Actions workflows run backend API tests and build the frontend on pushes or pull requests to `main`. These are CI-only workflows; they do not deploy to AWS.
