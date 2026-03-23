# Mini Workflow Engine

A full-stack workflow automation tool built with Sails.js (Backend) and React+Vite (Frontend).

## Features

- **Create Workflows**: Define workflows with sequential steps.
- **Trigger**: Every workflow has a unique HTTP endpoint.
- **Steps Supported**:
  - `transform`: Modify the context using templates or default values.
  - `filter`: conditional logic to skip execution.
  - `http_request`: Make external API calls.
- **Run History**: View logs and status of past executions.

## Tech Stack

- **Backend**: Sails.js (Node.js framework), TypeScript
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL (Production) / sails-disk (Local Dev)

## Setup & Running

### Prerequisites

- Node.js (v18+)
- (Optional) Docker for MySQL/PostgreSQL

### Local Development

1. **Install Dependencies**:

   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Start Backend**:

   ```bash
   # Starts Sails.js on http://localhost:1337
   sails lift
   ```

3. **Start Frontend**:

   ```bash
   # Starts Vite dev server on http://localhost:5173
   cd client
   npm run dev
   ```

4. **Access App**: Open http://localhost:5173

## Deployment

1. **Database**: Provision a PostgreSQL database (e.g., Supabase, Heroku Postgres).
2. **Backend**:
   - Set `DATABASE_URL` environment variable.
   - Deploy to Heroku/Render/Railway.
   - `npm start` runs `node app.js`.
3. **Frontend**:
   - Build using `npm run build` in `client/`.
   - Serve static files via Sails or deploy separately (Vercel/Netlify) with API proxy configured.

## Assumptions & Trade-offs

- **Authentication**: Omitted for simplicity (as per requirements).
- **Security**: Trigger URLs are public. In a real app, we'd add API keys or signatures.
- **Testing**: Basic verification via curl and manual UI testing. Integration tests can be added using `mocha`.
- **Typings**: TypeScript is configured but lenient (`noImplicitAny: false` in places) to speed up prototyping.

## API Documentation

- `GET /workflows`: List all workflows
- `POST /workflows`: Create a workflow
- `POST /t/:path`: Trigger a workflow run
- `GET /workflows/:id`: Get workflow details (includes runs)
