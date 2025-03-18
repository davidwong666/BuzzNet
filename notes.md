# Working with Your Docker Environment

- **Start Docker**: `docker-compose up -d` (-d: detached mode)
- **Stop Docker**: `docker-compose down`
- **Check Docker Status**: `docker ps`
- **Check Docker Logs**: `docker logs dev-environment` or `docker-compose logs dev`

- **Access Shell in Container**: `docker exec -it dev-environment bash` or `docker-compose exec dev bash`

- **In docker, run**: `npm run dev` to start the server.

## For Windows Machine:

Run `git config --global core.autocrlf false` and `git config --global core.eol lf` to prevent line ending issues.
