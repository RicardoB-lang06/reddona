# Resumen de calidad de código — RedDona

## SonarQube (análisis real, ejecutado en CI como *service container*)

Job `code-quality` en [`ci-cd.yml`](../../.github/workflows/ci-cd.yml). SonarQube Community
se levanta como *service container* dentro del propio job de GitHub Actions (sin depender de
un servidor externo ni de Docker local), se autentica, corre `sonar-scanner` sobre `src/` con
el reporte de cobertura (`lcov`) generado por Jest, y exporta las métricas antes de apagarse.
Resultado íntegro en [`sonarqube/sonarqube-metrics.json`](sonarqube/sonarqube-metrics.json):

| Métrica | Valor |
|---|---|
| Bugs | 0 |
| Vulnerabilidades | 0 |
| Code smells | 3 |
| Duplicación de líneas | 0.0 % |
| Complejidad ciclomática total | 83 |
| Líneas de código (ncloc) | 401 |
| Deuda técnica (sqale_index) | 70 minutos |
| Calificación de mantenibilidad (sqale_rating) | 1.0 (A) |
| Cobertura (calculada por Sonar sobre lcov) | 93.4 % |

## Herramientas complementarias (ejecutadas localmente)

Se usaron como respaldo y para iterar más rápido durante el desarrollo, antes de confirmar
cada resultado con SonarQube en CI:

- **ESLint** ([`eslint-report.txt`](eslint-report.txt)): 0 errores, 0 warnings tras corregir un
  code smell real detectado (complejidad ciclomática 9 en `updateDonor`, ver
  [`complexity-report.txt`](complexity-report.txt) y el commit que lo refactoriza extrayendo
  `pickDefinedFields`).
- **jscpd** ([`jscpd/jscpd-report.json`](jscpd/jscpd-report.json)): 0 % de líneas duplicadas
  en 457 líneas de código analizadas.
- **npm audit** ([`../security/npm-audit.txt`](../security/npm-audit.txt)): 0 vulnerabilidades
  en las dependencias de producción y desarrollo.
- **LOC** ([`loc-summary.txt`](loc-summary.txt)): 457 líneas en `src/`, 535 líneas de pruebas
  (`tests/`) — más código de prueba que de producción.
- **Cobertura de pruebas (Jest)**: 97.66 % statements / 88.73 % branches / 100 % funciones /
  97.57 % líneas (umbral exigido: 80 % global), ver
  [`../pruebas/jest-coverage-summary.txt`](../pruebas/jest-coverage-summary.txt).

## Interpretación

Con 0 bugs, 0 vulnerabilidades, 0 % de duplicación y una calificación de mantenibilidad A
(70 minutos de deuda técnica sobre 401 líneas de código), el módulo se ubica en un nivel de
calidad alto para un componente de este tamaño. Los 3 *code smells* restantes son de baja
severidad (estilo/convención) y no afectan la calificación de mantenibilidad global.
