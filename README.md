# Farmacias de Occidente - Sistema de Registro de Ventas

Sistema web completo para registrar y reportar ventas de puntos de venta de Farmacias de Occidente.

## Características

- ✅ Registro de ventas por turno (Diurno AM, Diurno PM, Nocturno)
- ✅ Gestión de sucursales, turnos y cuentas bancarias
- ✅ Cálculos automáticos de totales y faltantes
- ✅ Resumen por sucursal con indicadores clave
- ✅ Exportación de reportes a Excel (3 tipos de reportes)
- ✅ Validaciones y control de duplicados
- ✅ Interfaz moderna con React + TailwindCSS
- ✅ Base de datos local SQLite

## Stack Tecnológico

- **Frontend**: React 18 + Vite + TailwindCSS + React Router
- **Backend**: Node.js + Express + Sequelize
- **Base de datos**: SQLite (local)
- **Exportación Excel**: ExcelJS

## Requisitos Previos

- Node.js v18 o superior
- npm (incluido con Node.js)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/egar256/farmacias-occidente.git
cd farmacias-occidente
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

## Ejecución

### 1. Iniciar el servidor backend

```bash
cd backend
npm run dev
```

El backend se ejecutará en http://localhost:3001

Al iniciar por primera vez, se creará automáticamente:
- Base de datos SQLite con todas las tablas
- Turnos predeterminados (Diurno AM, Diurno PM, Nocturno)
- Cuentas bancarias iniciales
- Usuario administrador

### 2. Iniciar el frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

El frontend se ejecutará en http://localhost:5173

### 3. Acceder a la aplicación

Abrir el navegador en: http://localhost:5173

## Estructura del Proyecto

```
farmacias-occidente/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Configuración de SQLite
│   │   ├── models/
│   │   │   ├── index.js             # Inicialización de modelos y seed data
│   │   │   ├── Sucursal.js          # Modelo de sucursales
│   │   │   ├── Turno.js             # Modelo de turnos
│   │   │   ├── Cuenta.js            # Modelo de cuentas bancarias
│   │   │   ├── RegistroTurno.js     # Modelo de registros de ventas
│   │   │   └── Usuario.js           # Modelo de usuarios
│   │   ├── routes/
│   │   │   ├── sucursales.js        # CRUD de sucursales
│   │   │   ├── turnos.js            # CRUD de turnos
│   │   │   ├── cuentas.js           # CRUD de cuentas
│   │   │   ├── registros.js         # CRUD y resumen de registros
│   │   │   ├── reportes.js          # Exportación de reportes Excel
│   │   │   └── usuarios.js          # CRUD de usuarios
│   │   ├── services/
│   │   │   └── excelService.js      # Generación de reportes Excel
│   │   └── app.js                   # Aplicación Express principal
│   ├── package.json
│   └── .env                         # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           # Layout principal con navegación
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Panel principal
│   │   │   ├── RegistroVentas.jsx   # Formulario de registro
│   │   │   ├── ListadoRegistros.jsx # Listado con filtros
│   │   │   ├── ResumenSucursal.jsx  # Resumen por sucursal
│   │   │   ├── Reportes.jsx         # Página de reportes Excel
│   │   │   ├── Sucursales.jsx       # CRUD de sucursales
│   │   │   ├── Turnos.jsx           # CRUD de turnos
│   │   │   └── Cuentas.jsx          # CRUD de cuentas
│   │   ├── services/
│   │   │   └── api.js               # Cliente de API con Axios
│   │   ├── utils/
│   │   │   └── formatters.js        # Formateo de moneda y fechas
│   │   ├── App.jsx                  # Componente principal
│   │   ├── main.jsx                 # Punto de entrada
│   │   └── index.css                # Estilos con TailwindCSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Configuración de Vite
│   ├── tailwind.config.js           # Configuración de TailwindCSS
│   └── postcss.config.js            # Configuración de PostCSS
└── README.md
```

## Uso del Sistema

### Gestión de Catálogos

1. **Sucursales**: Crear y administrar puntos de venta
2. **Turnos**: Administrar turnos de trabajo (se incluyen 3 por defecto, se pueden agregar más)
3. **Cuentas**: Administrar cuentas bancarias (normales y especiales)

### Registro de Ventas

1. Ir a "Registro de Ventas"
2. Completar el formulario:
   - Fecha (requerido)
   - Sucursal (requerido)
   - Turno (requerido)
   - Cuenta de depósito
   - Montos (depositado, tarjeta, sistema, gastos, canjes)
3. Ver cálculos automáticos en tiempo real
4. Guardar registro

### Consulta y Filtrado

1. **Listado de Registros**: Ver todos los registros con filtros por fecha, sucursal y turno
2. **Resumen por Sucursal**: Ver totales agregados por sucursal en rango de fechas

### Reportes Excel

El sistema genera 3 tipos de reportes:

1. **Reporte Detalle**: Registros por turno/sucursal con indicador de faltantes
2. **Reporte Resumen Diario**: Agregado por día con bandera de faltante
3. **Reporte Resumen Global**: Consolidado por sucursal con totales generales

## Cuentas Predefinidas

El sistema incluye estas cuentas por defecto:

**Cuentas Normales:**
- 7100717710 - Grupo de negocios Tel - Interbanco

**Cuentas Especiales** (para total no facturado):
- 3285010891 - SELVIN GIAN TELLO - BANRURAL
- ALDO - ALDO IVAN TELLO - BANRURAL
- OFICINA - Oficina - Cuenta Especial

## Cálculos Automáticos

- **Total de Ventas** = Monto Depositado + Venta con Tarjeta
- **Total Vendido** = Total Sistema - Gastos - Canjes
- **Total Facturado** = Total de Ventas
- **Total Meta** = Total Vendido + Gastos
- **Total No Facturado** = Suma de depósitos a cuentas especiales
- **Faltante** = Total de Ventas - Total Sistema (se resalta en rojo si es negativo)

## Validaciones

- Los campos Fecha, Sucursal y Turno son obligatorios
- No se permite duplicar registros para la misma fecha + sucursal + turno
- Todos los campos monetarios deben ser >= 0

## Formato

- Moneda: Q 0,000.00 (Quetzales)
- Fecha: DD/MM/AAAA

## Tecnologías y Librerías

### Backend
- express: Framework web
- sequelize: ORM para SQLite
- sqlite3: Base de datos
- exceljs: Generación de archivos Excel
- cors: Manejo de CORS
- dotenv: Variables de entorno

### Frontend
- react: Biblioteca UI
- react-router-dom: Enrutamiento
- axios: Cliente HTTP
- tailwindcss: Framework CSS
- vite: Build tool

## Desarrollo

### Backend
```bash
cd backend
npm run dev    # Inicia el servidor en modo desarrollo
```

### Frontend
```bash
cd frontend
npm run dev    # Inicia Vite dev server
npm run build  # Construye para producción
```

## Base de Datos

La base de datos SQLite se crea automáticamente en `backend/database.sqlite` al iniciar el backend por primera vez.

Para reiniciar la base de datos, simplemente elimina el archivo `database.sqlite` y reinicia el backend.

## Soporte

Para problemas o preguntas, crear un issue en el repositorio de GitHub.

## Licencia

ISC
