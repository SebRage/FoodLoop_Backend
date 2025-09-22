// Nombres: permite letras, números, ciertos signos de puntuación, longitud mínima 3
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9&.,'’\-\s]{3,}$/;
// Alias mantenido por compatibilidad hacia atrás 
export const NAME_UPDATE_REGEX = NAME_REGEX;

// Email: verificación 
export const EMAIL_REGEX = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

// Contraseñas
// Crear: al menos 1 letra y 1 dígito; permite caracteres especiales; longitud 8..25
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/?]{8,25}$/;
// Actualizar: al menos 1 letra y 1 dígito; solo alfanuméricos; longitud mínima 6
export const PASSWORD_UPDATE_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

// Patrones generales útiles (agrega más según necesidad)
export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ISO_DATE_YYYY_MM_DD_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

// Exportación agrupada para conveniencia
export const REGEX = Object.freeze({
    NAME: NAME_REGEX,
    NAME_UPDATE: NAME_UPDATE_REGEX,
    EMAIL: EMAIL_REGEX,
    PASSWORD: PASSWORD_REGEX,
    PASSWORD_UPDATE: PASSWORD_UPDATE_REGEX,
    UUID_V4: UUID_V4_REGEX,
    ISO_DATE_YYYY_MM_DD: ISO_DATE_YYYY_MM_DD_REGEX,
});
