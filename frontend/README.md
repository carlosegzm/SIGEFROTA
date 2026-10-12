# SIGEFROTA Frontend

This is the frontend of the Fleet Management System (SIGEFROTA), built with React 19, Vite, TypeScript, Tailwind CSS v4, and React Router.

## Requirements

- Node.js (v18+)
- SIGEFROTA Backend running on port 8080 (URL is configurable)

## How to run locally

1. Clone the repository or navigate to the `frontend` folder.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   By default, the API URL is set to `http://localhost:8080`. If your backend is running elsewhere, update the `VITE_API_URL` variable in your `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the application in your browser: `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Compiles TypeScript and builds the application for production.
- `npm run lint`: Runs the linter to check for code quality.
- `npm run preview`: Previews the production build locally.

## Folder Structure

- `src/assets`: Static assets like images and fonts.
- `src/components`: Reusable UI components (Modals, Selects, Layouts).
- `src/context`: React Context for global state (e.g., AuthContext).
- `src/pages`: Main application views (Dashboard, Vehicles, Drivers, etc).
- `src/services`: API integration and communication setup.
- `src/types`: TypeScript definitions and interfaces.
- `src/utils`: Helper functions and utilities.

## Features and Roles (Role-based Authorization)

- **Authentication**: The system requires login for protected routes and manages JWTs globally.
- **Registration**: New users are always registered with the `DRIVER` role.
- **Roles & Permissions**:
  - `FLEET_MANAGER`: Has full access (create, edit, inactivate, status change, and user management).
  - `DRIVER` and `FINANCE`: Have read-only access (view lists and details only).
- **Data Handling**: Validations for dates, odometers, fuel consumption calculations, and visual highlights for anomalies or expiring documents.

## Limitações Conhecidas

- Mudar o role de um usuário só tem efeito no próximo login dele (o role vem do JWT).
- O primeiro `FLEET_MANAGER` é criado manualmente no banco de dados.
- O filtro por veículo nas manutenções/abastecimentos/documentos é feito no cliente (a API devolve a lista inteira).
