# BuzzNet

Group Project for CSCI3100 2024-25 Sem 2 at CUHK

# Dev Environment Setup

This project uses VS Code's Remote Development extension for a consistent development environment:

1. Install [VS Code](https://code.visualstudio.com/) and the [Remote Development extension pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
2. Clone this repository
3. Open the repository in VS Code
4. When prompted, click "Reopen in Container" or run the "Remote-Containers: Reopen in Container" command

# Working with Your Docker Environment

- **Start Docker**: `docker-compose up -d` (-d: detached mode)
- **Stop Docker**: `docker-compose down`
- **Check Docker Status**: `docker ps`
- **Check Docker Logs**: `docker logs dev-environment` or `docker-compose logs dev`

- **Access Shell in Container**: `docker exec -it dev-environment bash` or `docker-compose exec dev bash`

- **In docker, run**: `npm run dev` to start the server.

# For Windows Machine:

Run `git config --global core.autocrlf false` and `git config --global core.eol lf` to prevent line ending issues.

# /app/frontend

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
