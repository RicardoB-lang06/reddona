# RedDona API — Módulo de Registro de Personas Donantes

Proyecto final de Ingeniería de Software. Implementa el módulo básico de **registro de
personas donantes** para la plataforma RedDona (gestión de donaciones de alimentos y
recursos entre empresas y organizaciones sociales), con autenticación **JWT**, control de
acceso por **roles** (`admin` / `usuario`), pruebas unitarias con cobertura ≥ 80 % y un
pipeline de **CI/CD** en GitHub Actions.

## Arquitectura

Arquitectura monolítica modular de 3 capas (rutas → controladores → modelos), consistente
con el diseño definido en la fase de "Avance del proyecto":

```
src/
  app.js               # Configuración de Express (helmet, cors, rutas)
  server.js            # Punto de entrada, arranca el servidor
  config/env.js        # Variables de entorno
  middleware/
    auth.js            # authenticate (JWT) y authorize (roles)
    errorHandler.js     # Manejo centralizado de errores y 404
  models/
    userStore.js        # Persistencia en memoria de usuarios (hash bcrypt)
    donorStore.js        # Persistencia en memoria de personas donantes
    bootstrap.js         # Crea un usuario admin inicial desde variables de entorno
  routes/
    authRoutes.js        # /api/auth/*
    donorRoutes.js        # /api/donors/*
  controllers/
    authController.js
    donorController.js
  utils/
    jwt.js               # sign/verify de tokens
    validators.js        # Reglas de validación (express-validator)
```

> Nota de alcance: para este módulo básico la persistencia es **en memoria** (no requiere
> base de datos externa), lo que simplifica las pruebas automatizadas y el pipeline de CI.
> La versión completa del sistema (fuera de este entregable) usaría PostgreSQL, como se
> definió en la arquitectura del proyecto.

## Seguridad implementada

- **Autenticación JWT** con expiración configurable (`JWT_SECRET`, `JWT_EXPIRES_IN`).
- **Roles** `admin` / `usuario`: el registro público **siempre** crea un usuario con rol
  `usuario` (el rol nunca se acepta desde el cuerpo de la petición), evitando escalación de
  privilegios. Un administrador puede promover usuarios vía `PATCH /api/auth/users/:id/role`.
- **Hash de contraseñas** con bcrypt (10 rounds).
- **Cabeceras de seguridad HTTP** con `helmet`.
- **Validación y sanitización de entradas** con `express-validator` (mitiga XSS/inyección).
- **Rate limiting** en el login (20 intentos / 15 min) para dificultar fuerza bruta.
- **Control de acceso por dueño de recurso**: solo el usuario que registró una persona
  donante (o un admin) puede editar su registro; solo un admin puede eliminarlo.

## Endpoints

| Método | Ruta                          | Auth | Rol requerido | Descripción                          |
|--------|-------------------------------|------|----------------|---------------------------------------|
| GET    | `/health`                     | No   | -              | Estado del servicio                   |
| POST   | `/api/auth/register`          | No   | -              | Registra un usuario (rol `usuario`)   |
| POST   | `/api/auth/login`              | No   | -              | Inicia sesión, retorna JWT            |
| GET    | `/api/auth/me`                 | Sí   | cualquiera     | Perfil del usuario autenticado        |
| GET    | `/api/auth/users`               | Sí   | admin          | Lista de usuarios                     |
| PATCH  | `/api/auth/users/:id/role`      | Sí   | admin          | Cambia el rol de un usuario           |
| POST   | `/api/donors`                   | Sí   | cualquiera     | Registra una persona donante          |
| GET    | `/api/donors`                    | Sí   | cualquiera     | Lista personas donantes               |
| GET    | `/api/donors/:id`                | Sí   | cualquiera     | Detalle de una persona donante        |
| PUT    | `/api/donors/:id`                 | Sí   | dueño o admin  | Actualiza una persona donante         |
| DELETE | `/api/donors/:id`                  | Sí   | admin          | Elimina una persona donante           |

## Cómo correrlo localmente

```bash
cp .env.example .env
npm install
npm start
```

## Pruebas

```bash
npm run lint             # ESLint
npm test                 # Pruebas unitarias (Jest + Supertest)
npm run test:coverage    # Con reporte de cobertura (umbral global 80%)
```

## CI/CD

El workflow [`ci-cd.yml`](.github/workflows/ci-cd.yml) corre en cada push/PR a `main`:

1. **test** — instala dependencias, corre lint y pruebas unitarias con cobertura,
   publica el reporte como artefacto.
2. **security-scan** — levanta la API y ejecuta un **escaneo OWASP ZAP (baseline)**
   contra ella, publicando el reporte HTML/JSON como artefacto.
3. **build-and-push** — construye la imagen Docker y la publica en GitHub Container
   Registry (`ghcr.io`).
4. **deploy-staging** — despliega la imagen recién construida en un contenedor de
   "entorno de prueba" y ejecuta un smoke test contra `/health`.

Los reportes de pruebas de seguridad y de calidad de código (SonarQube) ejecutados de
forma local se documentan en [`docs/security`](docs/security) y [`docs/calidad`](docs/calidad).
