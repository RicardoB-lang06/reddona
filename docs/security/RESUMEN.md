# Resumen de pruebas de seguridad — RedDona

## OWASP ZAP (escaneo dinámico, baseline)

Job `security-scan` en [`ci-cd.yml`](../../.github/workflows/ci-cd.yml): se levanta la API
en el runner de CI y se ejecuta el contenedor oficial de OWASP ZAP (`zap-baseline.py`) contra
ella. Reporte completo en [`zap-report/`](zap-report).

**Primera corrida** (commit `9a6a975`): 0 High, 1 Medium, 5 Informational.

| Hallazgo | Severidad | Causa raíz | Corrección |
|---|---|---|---|
| Cross-Domain Misconfiguration [10098] | Media | `cors()` sin restricciones reflejaba cualquier `Origin` | Se agregó un allowlist configurable por `CORS_ORIGIN` en [`src/app.js`](../../src/app.js), que solo refleja orígenes autorizados y bloquea el resto |
| Storable and Cacheable Content [10049] | Baja (warning) | Respuestas JSON con datos de usuario/sesión sin cabeceras de caché | Se agregó `Cache-Control: no-store` a todas las respuestas de la API |

**Corrida final** (commit `c630a89`, con `CORS_ORIGIN` configurado): **0 High, 0 Medium, 0 Low,
5 Informational** (cabeceras `Sec-Fetch-*`, informativas y dependientes del navegador cliente,
no aplicables a una API JSON consumida por otro backend/SPA).

## npm audit (dependencias)

0 vulnerabilidades encontradas en las 467 dependencias (directas + transitivas). Ver
[`npm-audit.txt`](npm-audit.txt).

## Controles de seguridad implementados en el código

- Autenticación JWT + hash de contraseñas con bcrypt.
- Autorización por rol (`admin`/`usuario`) en middleware, aplicada por ruta.
- El registro público nunca acepta un rol desde el cliente (previene escalación de
  privilegios) — ver [`src/controllers/authController.js`](../../src/controllers/authController.js).
- Validación y sanitización de entradas con `express-validator` (mitiga XSS/inyección).
- Rate limiting en `/api/auth/login` (mitiga fuerza bruta).
- Cabeceras de seguridad HTTP con `helmet`.
- CORS restringido por allowlist configurable.
- `Cache-Control: no-store` en respuestas con datos sensibles.
