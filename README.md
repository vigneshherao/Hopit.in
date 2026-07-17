# Hopit

Hopit is an AI powered agriculture platform foundation connecting land owners, farmers, and farm workers. The project is organized as a modular monolith with a React frontend and an Express API backend.

## Tech Stack

- Frontend: React 19, Vite, JavaScript, Tailwind CSS, React Router, React Hook Form, TanStack Query, Axios, Framer Motion, Zod, shadcn-style UI primitives, Lucide Icons
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT ready middleware, Multer, Cloudinary ready configuration, Zod validation
- Development: ESLint, Prettier, Husky, lint-staged, dotenv, nodemon
- Deployment: Vercel frontend and Render backend ready

## Installation

Run this from the project root:

```bash
npm install
```

This installs the root development tooling and both workspace applications.

## Environment Variables

Create environment files from the included examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Frontend variables:

```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

Backend variables:

```env
NODE_ENV=development
PORT=5001
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/hopit
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Running Frontend

```bash
npm run dev --workspace frontend
```

This starts Vite at `http://localhost:5173`.

## Running Backend

```bash
npm run dev --workspace backend
```

This starts the Express API at `http://localhost:5001/api/v1`.

Health check:

```bash
curl http://localhost:5001/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "uptime": 12.345
}
```

## Run Both Apps

```bash
npm run dev
```

This starts the frontend and backend workspaces together for local development.

## Available Scripts

Root:

- `npm install`: install all workspace dependencies.
- `npm run dev`: run frontend and backend together.
- `npm run lint`: lint frontend and backend.
- `npm run format`: format source, config, and documentation files.

Frontend:

- `npm run dev --workspace frontend`: start Vite.
- `npm run build --workspace frontend`: create a production build.
- `npm run preview --workspace frontend`: preview the production build.
- `npm run lint --workspace frontend`: run ESLint.

Backend:

- `npm run dev --workspace backend`: start nodemon with TypeScript.
- `npm run build --workspace backend`: compile TypeScript to `dist`.
- `npm start --workspace backend`: run compiled server.
- `npm run lint --workspace backend`: run ESLint.

## Folder Structure

```text
Hopit.in/
  frontend/
    src/
      assets/
      components/
      constants/
      context/
      hooks/
      layouts/
      pages/
      routes/
      services/
      types/
      utils/
  backend/
    src/
      config/
      controllers/
      interfaces/
      middleware/
      models/
      routes/
      services/
      types/
      utils/
      validators/
  docs/
```

## Deployment

### Frontend on Vercel

Use `frontend` as the project root.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`

### Backend on Render

Use `backend` as the service root.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Required environment variables: all backend variables listed above.

## Notes

This repository contains the complete project foundation only. It intentionally avoids domain business logic so authentication flows, leasing workflows, job matching, and AI recommendations can be added cleanly inside the existing modules.
