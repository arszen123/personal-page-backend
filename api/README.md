# Skeleton project for Swagger
## DEPLOY:
```bash
docker build . --tag registry.heroku.com/[app-id]/web
heroku container:push -a [app-id] web
heroku container:release -a [app-id] web
```
