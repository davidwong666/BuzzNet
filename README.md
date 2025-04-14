# BuzzNet

Group Project for CSCI3100 2024-25 Sem 2 at CUHK

# Developer's Role

- Zhang Ka Sing - Frontend
- Peng Minqi - Frontend
- Li Chun Leung - Backend
- Zeng Bai Chuan - Backend
- Wong Kwok Kam - Backend

# Dev Env Setup

This project uses VS Code's **Remote Development extension** for a consistent development environment:

1. Install [VS Code](https://code.visualstudio.com/) and the [Remote Development extension pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
2. Clone this repository via **HTTPS**
3. Open the repository in VS Code
4. When prompted, click "**Reopen in Container**" or run the "Remote-Containers: Reopen in Container" command

# Working with Your Docker Environment

- **Start Docker** (should be automatically done for you): `docker-compose up -d` (-d: detached mode)
- **Stop Docker**: `docker-compose down`
- **Check Docker Status**: `docker ps`
- **Check Docker Logs**: `docker logs dev-environment` or `docker-compose logs dev`

- **Access Shell in Container**: `docker exec -it dev-environment bash` or `docker-compose exec dev bash`

- **In docker, run**: `npm run dev` to start the server.

# For Windows Machine:

Run `git config --global core.autocrlf false` and `git config --global core.eol lf` to prevent line ending issues.

# React + Vite

Success! Created frontend at /app/frontend
Inside that directory, you can run several commands:

npm start
Starts the development server.

npm run build
Bundles the app into static files for production.

npm test
Starts the test runner.

npm run eject
Removes this tool and copies build dependencies, configuration files and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

cd /app/frontend
npm start

# ChangeLog

## 14-04-2025 Updates by Baichuan ZENG

I've implemented a simple but comprehensive set of functions for both frontend and backend. Here's what I've created:

- Backend:
  MongoDB Post Model: Created a schema for posts with fields for title, content, author, likes, and creation date.
  Database Connection: Set up a MongoDB connection configuration with error handling.
  Post Controller: Implemented controller functions for CRUD operations (Create, Read, Update, Delete) and a like function.
  Routes: Created API routes for posts with appropriate HTTP methods.
  Express Server: Updated the main server file to use routes and DB connection.
  Deployed on Vercel https://vercel.com/nokktsangs-projects/buzz-net-backend

- Frontend:
  Post List Component: Fetches and displays posts from the API.
  Post Item Component: Displays individual posts with formatted date, expandable content, and like functionality.
  Post Form Component: Allows users to create new posts with validation.
  Main App Component: Integrates all components with a clean layout and refresh functionality.
  Real-time refreshing of the webpage
  CSS Styling: Added comprehensive styling for a modern, responsive UI.
  Deployed on Vercel https://vercel.com/nokktsangs-projects/buzz-net-frontend

- Database:
  Collections: posts
  Deployed on MongoDB https://cloud.mongodb.com/v2/67fc861383cfad4a0275d512#/overview

- To use this application locally:
  Start the backend server: cd BuzzNet/backend && npm run dev
  Start the frontend development server: cd BuzzNet/frontend && npm run dev

- Check out the prototype on: https://buzz-net-tau.vercel.app/ and https://github.com/NokkTsang/BuzzNet

## 22-03-2025 Suggestions from Professor

Adding more details:

- Encryption
- Rate Limit
- Internationalization
- Provide reason on choosing MongoDB

Communication between frontend and backend: RESTful API Information

Consider removing some part due to tiem limit

## 27-03-2025 Division of labor

Added [Developer's Role](#developers-role)

## 03-04-2025 Modifying development setup guide

Removed ssh mount, change to https instead (easier set up)
