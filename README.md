# Lienzzo — Gestor de finanzas personales

Aplicación web para registrar ingresos y gastos, organizarlos por categorías y visualizar la salud financiera personal mediante un dashboard interactivo.

Construida con **Next.js 16** (App Router + Turbopack), **PostgreSQL** sobre **Neon** y autenticación con **BetterAuth**.

---

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Modelo de datos](#modelo-de-datos)
- [API REST](#api-rest)
- [Despliegue](#despliegue)
- [Licencia](#licencia)

---

## Características

- **Autenticación con email y contraseña** mediante BetterAuth, con sesiones persistentes de 7 días.
- **Gestión de movimientos**: crear, editar, **duplicar** y eliminar ingresos o gastos. Búsqueda por concepto, filtros por tipo, categoría y rango de fechas, y paginación.
- **Categorías personalizadas** con color e icono.
- **Dashboard analítico** con KPIs, serie temporal de ingresos/gastos, distribución por categoría (donut) y comparativa mensual (barras).
- **Filtros temporales** preconfigurados: este mes, mes anterior, año en curso, etc.
- **Tema claro/oscuro** con persistencia.
- **UI accesible** construida sobre Base UI y shadcn/ui, con Tailwind CSS v4.
- **Validación de extremo a extremo** con Zod (cliente y servidor comparten el mismo esquema).

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, Server Actions) |
| Lenguaje | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com), [Base UI](https://base-ui.com), lucide-react |
| Gráficos | [Recharts](https://recharts.org) |
| Estado servidor | [TanStack Query v5](https://tanstack.com/query) |
| Formularios | React Hook Form + Zod |
| Base de datos | PostgreSQL ([Neon](https://neon.tech) serverless) |
| Cliente DB | `pg` (node-postgres) |
| Autenticación | [BetterAuth](https://www.better-auth.com) |
| Notificaciones | [Sonner](https://sonner.emilkowal.ski) |
| Linter / formato | ESLint 9, Prettier 3 |

---

## Estructura del proyecto

```
RepoPrueba/
├── app/
│   ├── (app)/                  # Layout autenticado
│   │   ├── dashboard/          # Panel principal con gráficos
│   │   ├── movimientos/        # Listado, filtros y CRUD de movimientos
│   │   ├── categorias/         # Gestión de categorías
│   │   └── configuracion/      # Ajustes de usuario
│   ├── api/                    # Route handlers (REST)
│   │   ├── auth/[...all]/      # Endpoints de BetterAuth
│   │   ├── movements/          # CRUD de movimientos
│   │   ├── categories/         # CRUD de categorías
│   │   └── dashboard/          # Agregaciones (summary, timeseries, by-category)
│   ├── login/                  # Inicio de sesión
│   └── signup/                 # Registro
├── components/                 # Componentes reutilizables (UI, diálogos, layout)
├── hooks/                      # Hooks de TanStack Query (use-movements, use-categories…)
├── lib/                        # Utilidades de servidor: db, auth, validaciones Zod
├── scripts/                    # Tareas de mantenimiento (seed, consultas, borrado)
└── public/                     # Recursos estáticos
```

---

## Requisitos previos

- **Node.js** ≥ 20
- **npm** ≥ 10 (también funciona con pnpm o yarn)
- Una base de datos **PostgreSQL** accesible (se recomienda [Neon](https://neon.tech))

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd RepoPrueba

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env   # luego edita .env con tus credenciales

# 4. Crear un usuario inicial (opcional)
npm run tsx scripts/seed-user.ts

# 5. Arrancar el servidor de desarrollo
npm run dev
```

La aplicación quedará disponible en `http://localhost:3000`.

---

## Variables de entorno

Crea un fichero `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Cadena de conexión a PostgreSQL.
# Para Neon u otro proveedor con SSL público se recomienda sslmode=verify-full.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=verify-full&channel_binding=require"

# Secreto para firmar las sesiones de BetterAuth (>= 32 caracteres aleatorios).
BETTER_AUTH_SECRET="cambia-este-valor-en-produccion"

# URL pública de la aplicación.
BETTER_AUTH_URL="http://localhost:3000"
```

> **Nota de seguridad:** no expongas `DATABASE_URL` ni `BETTER_AUTH_SECRET` en código cliente, y no los subas al repositorio.

---

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con Turbopack (`http://localhost:3000`). |
| `npm run build` | Compila la aplicación para producción. |
| `npm start` | Sirve la build de producción. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm run format` | Formatea el código con Prettier. |
| `npm run typecheck` | Verifica los tipos con `tsc` sin emitir. |

**Scripts auxiliares** (vía `tsx`):

| Comando | Descripción |
| --- | --- |
| `npx tsx scripts/seed-user.ts` | Crea un usuario de pruebas. |
| `npx tsx scripts/query-users.ts` | Lista los usuarios existentes. |
| `npx tsx scripts/delete-user.ts` | Elimina un usuario. |

---

## Modelo de datos

Esquema resumido de las tablas principales:

- **`user`, `session`, `account`, `verification`** — tablas gestionadas por BetterAuth.
- **`categories`** — categorías de usuario (`id`, `user_id`, `name`, `color`, `icon`).
- **`movements`** — movimientos financieros:
  - `id` (uuid)
  - `user_id` (uuid, FK)
  - `type` (`INGRESO` | `GASTO`)
  - `concept` (texto, máx. 140)
  - `amount` (numeric, ≥ 0)
  - `category_id` (uuid, FK opcional)
  - `date` (date)
  - `created_at`, `updated_at`

Todas las consultas filtran por `user_id` extraído de la sesión, garantizando el aislamiento entre usuarios.

---

## API REST

Todos los endpoints viven bajo `/api` y requieren sesión activa (excepto los de autenticación).

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/[...]` | Endpoints de BetterAuth (sign-in, sign-up, sign-out…). |
| `GET` | `/api/movements` | Lista movimientos con filtros y paginación. |
| `POST` | `/api/movements` | Crea un movimiento. |
| `PATCH` | `/api/movements/:id` | Actualiza un movimiento. |
| `DELETE` | `/api/movements/:id` | Elimina un movimiento. |
| `GET` | `/api/categories` | Lista categorías del usuario. |
| `POST` | `/api/categories` | Crea una categoría. |
| `GET` | `/api/dashboard/summary` | KPIs agregados (ingresos, gastos, balance). |
| `GET` | `/api/dashboard/timeseries` | Serie temporal para gráficas. |
| `GET` | `/api/dashboard/by-category` | Distribución del gasto por categoría. |

---

## Despliegue

El proyecto está preparado para desplegarse en cualquier plataforma compatible con Next.js 16 (Vercel, Railway, Fly.io, contenedor propio…).

**Pasos típicos en Vercel:**

1. Conecta el repositorio a Vercel.
2. Configura las variables de entorno (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`).
3. Asegúrate de que `BETTER_AUTH_URL` apunta al dominio de producción.
4. Despliega — Vercel ejecutará `next build` automáticamente.

---

## Licencia

Proyecto privado. Todos los derechos reservados.
