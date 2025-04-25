import dotenv from 'dotenv';
dotenv.config();

// Environment and Server
export const environment = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || 3000;
export const serverUrl = process.env.SERVER_URL?.trim() || '';

// Database Config
export const db = {
  name: process.env.DB_NAME || '',
  url: process.env.DB_URL || '',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5', 10),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
};

// CORS URLs (as array)
export const corsUrl = process.env.CORS_URL?.split(',').map(url => url.trim()) || [];
console.log('Allowed CORS URLs:', corsUrl);

// Cookie Validity
export const cookieValidity = process.env.COOKIE_VALIDITY_SEC || '0';

// Token Config
export const tokenInfo = {
  jwtSecretKey: process.env.JWT_SECRET_KEY || '',
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || '0', 10),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || '0', 10),
  issuer: process.env.TOKEN_ISSUER || '',
  audience: process.env.TOKEN_AUDIENCE || '',
};
