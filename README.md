для того чтобы запустить приложение:

1. ```bash
   cp .env.example .env
   ```

и не забыть задать переменные окружения

2. ```bash
   cd ./infrastructure
   docker compose --env-file ../.env up
   ```

и приложение запустится

Swagger документация будет доступна по http://localhost:3000/api/v1/docs
