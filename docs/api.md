# AgriOptima AI — REST API Reference

Interactive Swagger documentation is served at `/docs` and `/api/docs`.

## Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and online status of ML & LP engines |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT bearer token |
| `GET` | `/api/auth/me` | Fetch active authenticated profile |
| `GET` | `/api/crops` | Retrieve 12 benchmark crops and agronomic constants |
| `GET` | `/api/farms` | List farm holdings for current user |
| `GET` | `/api/farms/:id` | Fetch specific farm holding |
| `POST` | `/api/farms` | Create a new farm holding |
| `PUT` | `/api/farms/:id` | Update farm holding data |
| `DELETE` | `/api/farms/:id` | Delete farm holding |
| `POST` | `/api/analyze` | AI crop suitability ranking, yield prediction, risk & XAI |
| `POST` | `/api/yield-prediction` | Predict yield and revenue for a specific crop |
| `POST` | `/api/optimize` | Solve constrained Linear Programming resource allocation |
| `POST` | `/api/scenario` | What-If multi-resource simulation engine (Before vs After) |
| `GET` | `/api/farm-plans` | Retrieve archived optimization plans |
| `POST` | `/api/farm-plans` | Archive an optimized farm plan |
| `DELETE` | `/api/farm-plans/:id` | Delete an archived plan |
