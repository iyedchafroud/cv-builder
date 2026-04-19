# CV Builder

## Stack

- Client: Vite + React + React Router + Tailwind CSS
- Server: Express + MongoDB + Mongoose + JWT
- PDF: `jspdf` on the client

## Project Structure

```text
cv-builder/
|-- client/
|-- server/
|-- package.json
```

## Environment Setup

Create these files before running the app:

- `client/.env`
- `server/.env`

Use the provided `.env.example` files in each workspace as the template.

## Install

Run this once from the project root:

```bash
npm install
```

Because the repo uses npm workspaces, that installs dependencies for both `client` and `server`.

## Run in Development

From the project root:

```bash
npm run dev
```

Client default URL: `http://localhost:5173`

Server default URL: `http://localhost:5000`

## Production Build

```bash
npm run build
```

## Main Features

- Sign up and sign in with JWT authentication
- Protected dashboard editor
- Live CV preview
- Debounced autosave to MongoDB
- PDF download in the browser
