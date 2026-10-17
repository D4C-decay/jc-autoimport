---
tags:
  - index
  - dashboard
type: moc
---

# 🏠 JC Autoimport — Dashboard

> Última actualización: 2026-09-08

## 🔴 Estado actual

**Fase:** Backend completo y optimizado · runtime validado · tests en verde
**Bloqueado por:** Stripe/S3/email claves reales (production), dominio/HTTPS
**Siguiente paso:** Ampliar dataset de demo (>10k vehículos) para benchmark a escala

### Métricas backend

| Métrica | Valor | Meta | ✅ |
|---|---|---|---|
| Módulos | 9/9 | 9 | ✅ |
| Tests unitarios | 18 | 20+ | ✅ |
| Tests e2e | 4 | 4+ | ✅ |
| Full-text (50k filas, GIN) | 2,7 ms | <100 ms | ✅ |
| Payload catálogo (gzip) | -56 % | -50 % | ✅ |

## 🗂️ Navegación

- [[Estado/Backend|Estado del backend]]
- [[Estado/Backlog|Backlog]]
- [[Estado/Blockers|Blockers]]
- [[Arquitectura/Stack|Stack tecnológico]]
- [[Arquitectura/Agentes|Agentes de trabajo]]
- [[Decisiones/001-esm-imports|Decisiones (registro)]]
- [[Operaciones/Despliegue|Despliegue]]
- [[Logs/Bitácora|Bitácora de sesiones]]

## 🔥 Últimos logs

```dataview
TABLE file.cday AS "Creada"
FROM "Logs"
SORT file.name DESC
LIMIT 5
```

## ⚠️ Blockers abiertos

```dataview
LIST
FROM "Estado/Blockers"
WHERE !contains(file.name, "Resuelto")
```

## 📌 Enlaces útiles

- Código: [jc-autoimport](https://github.com/D4C-decay/jc-autoimport) (privado)
- Swagger local: [[`http://localhost:3000/api/docs`]]