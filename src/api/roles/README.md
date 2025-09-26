# Roles API - Children's World

## 📋 Descripción

El módulo de Roles proporciona endpoints para gestionar los roles de usuario en el sistema. Los roles definen los permisos y accesos que tiene cada usuario en la aplicación.

## 🚀 Endpoints Disponibles

### GET /api/roles

**Descripción**: Obtiene todos los roles disponibles en el sistema.

**Autenticación**: Requerida (JWT Bearer Token)

**Permisos**: Solo administradores

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Respuesta Exitosa (200)**:
```json
[
  {
    "id": 1,
    "name": "administrator",
    "description": "System administrator with full access to all features",
    "createdAt": "2025-09-24T05:18:01.000Z"
  },
  {
    "id": 2,
    "name": "educator",
    "description": "Daycare educator with limited access",
    "createdAt": "2025-09-24T05:18:01.000Z"
  },
  {
    "id": 3,
    "name": "parent",
    "description": "Parent with access to their children information",
    "createdAt": "2025-09-24T05:18:01.000Z"
  }
]
```

**Respuestas de Error**:

- **401 Unauthorized**: Token inválido o faltante
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

- **403 Forbidden**: Permisos insuficientes
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## 🏗️ Estructura del Módulo

```
src/api/roles/
├── roles.controller.ts    # Controlador con endpoints
├── roles.service.ts       # Lógica de negocio
├── roles.module.ts        # Configuración del módulo
├── dto/
│   └── role-response.dto.ts  # DTO para respuesta
└── README.md              # Esta documentación
```

## 🔧 Implementación Técnica

### Controlador (`roles.controller.ts`)
- **Decoradores**: `@Controller('roles')`, `@UseGuards(JwtAuthGuard, RolesGuard)`
- **Protección**: Solo administradores pueden acceder
- **Documentación**: Swagger/OpenAPI integrado

### Servicio (`roles.service.ts`)
- **Método**: `getRoles()` - Obtiene todos los roles ordenados por ID
- **Base de datos**: Usa TypeORM con la entidad `UserRolesEntity`

### DTO (`role-response.dto.ts`)
- **Propiedades**:
  - `id`: Identificador único del rol
  - `name`: Nombre del rol
  - `description`: Descripción del rol (nullable)
  - `createdAt`: Fecha de creación (nullable)

## 🔐 Seguridad

- **Autenticación JWT**: Requerida para todos los endpoints
- **Autorización**: Solo administradores pueden acceder
- **Validación**: Usa guards de NestJS para validar permisos

## 📊 Roles Disponibles

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | administrator | Administrador del sistema con acceso completo |
| 2 | educator | Educador con acceso limitado a niños y asistencia |
| 3 | parent | Padre/Madre con acceso a información de sus hijos |

## 🧪 Ejemplos de Uso

### cURL
```bash
# Obtener todos los roles
curl -X GET "http://localhost:30000/api/roles" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:30000/api/roles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const roles = await response.json();
```

### React/Refine
```typescript
const { data: roles } = useCustom({
  url: 'http://localhost:30000/api/roles',
  method: 'get',
});
```

## 🔄 Integración con Frontend

El endpoint se integra con el formulario de registro de usuarios en el frontend:

1. **Carga de roles**: Se cargan automáticamente al abrir el formulario
2. **Selector de roles**: Muestra la descripción del rol como etiqueta
3. **Validación**: Requiere selección de un rol válido
4. **Envío**: Envía el `roleId` al crear el usuario

## 📝 Notas de Desarrollo

- **Ordenamiento**: Los roles se devuelven ordenados por ID ascendente
- **Nullable fields**: `description` y `createdAt` pueden ser null
- **Performance**: Consulta simple sin joins complejos
- **Caching**: Considerar implementar cache para roles estáticos

## 🚨 Consideraciones

- **Permisos**: Solo administradores pueden ver los roles
- **Datos sensibles**: No se exponen permisos específicos, solo descripciones
- **Escalabilidad**: Para muchos roles, considerar paginación
- **Internacionalización**: Las descripciones podrían necesitar traducción
