# Farmish MERN API

## Local setup

1. Copy `.env.example` to `.env` and add your MongoDB Atlas URI and a JWT secret.
2. Install dependencies with `npm install`.
3. Seed the catalog with `npm run server:seed`.
4. Start the API with `npm run server`.
5. In a second terminal, start the React client with `npm start`.

The API runs at `http://localhost:5000` and the client proxies `/api` requests to it.
