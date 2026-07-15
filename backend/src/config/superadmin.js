const DEFAULT_SUPERADMIN_EMAIL = "shubhankeranand18@gmail.com";

export function getSuperadminEmail() {
  return (process.env.SUPERADMIN_EMAIL || DEFAULT_SUPERADMIN_EMAIL).trim().toLowerCase();
}

export function isSuperadminEmail(email) {
  return Boolean(email) && email.toLowerCase() === getSuperadminEmail();
}
