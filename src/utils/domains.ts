// Domain configuration utilities
export const DOMAINS = {
  USER_DOMAIN: import.meta.env.VITE_USER_DOMAIN || 'installment.mobile.phitik.com',
  ADMIN_DOMAIN: import.meta.env.VITE_ADMIN_DOMAIN || 'admin.installment.mobile.phitik.com',
  SUPPORT_EMAIL: `support@${import.meta.env.VITE_USER_DOMAIN?.replace('installment.mobile.', '') || 'phitik.com'}`
} as const;

// URL builders
export const URLS = {
  USER_PORTAL: `https://${DOMAINS.USER_DOMAIN}`,
  ADMIN_PORTAL: `https://${DOMAINS.ADMIN_DOMAIN}`,
  USER_REGISTRATION: `https://${DOMAINS.USER_DOMAIN}/`,
  SUPPORT_EMAIL: `mailto:${DOMAINS.SUPPORT_EMAIL}`
} as const;

// QR Code URL builder
export const getQRCodeUrl = (data: string, size: number = 220) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}; 