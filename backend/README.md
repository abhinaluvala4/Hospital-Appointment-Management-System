# Backend quick start (Windows PowerShell)

From this directory, run:

```powershell
./mvnw.cmd spring-boot:run
```

The included wrapper bootstraps Apache Maven 3.10.0 under your user profile the first time it runs, then invokes the project build. It requires JDK 17+ and internet access for the Maven and Java dependencies.

Start PostgreSQL before launching the API. From the repository root, `docker compose up -d db` starts the development database if Docker Desktop is installed. Otherwise, configure a PostgreSQL database and set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in the shell before starting the API.
