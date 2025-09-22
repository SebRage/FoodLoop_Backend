/**
 * Centralized regular expressions used across the backend.
 * Keep semantics stable; if you change a pattern, review validators and tests.
 */

// Names: allow letters (incl. accents), numbers, selected punctuation, min length 3
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9&.,'’\-\s]{3,}$/;
// Alias kept for backwards compatibility (same rule for updates currently)
export const NAME_UPDATE_REGEX = NAME_REGEX;

// Email: simple RFC-like check (username@domain.tld)
export const EMAIL_REGEX = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

// Passwords
// Create: at least 1 letter and 1 digit; allows specials; length 8..25
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/?]{8,25}$/;
// Update: at least 1 letter and 1 digit; only alphanumeric; length 6+
export const PASSWORD_UPDATE_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

// Useful general-purpose patterns (add more as needed)
export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ISO_DATE_YYYY_MM_DD_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

// Grouped export for convenience
export const REGEX = Object.freeze({
	NAME: NAME_REGEX,
	NAME_UPDATE: NAME_UPDATE_REGEX,
	EMAIL: EMAIL_REGEX,
	PASSWORD: PASSWORD_REGEX,
	PASSWORD_UPDATE: PASSWORD_UPDATE_REGEX,
	UUID_V4: UUID_V4_REGEX,
	ISO_DATE_YYYY_MM_DD: ISO_DATE_YYYY_MM_DD_REGEX,
});