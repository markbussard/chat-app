export const PG_HOST = process.env.PG_HOST ?? '';
export const PG_USER = process.env.PG_USER ?? '';
export const PG_PASSWORD = process.env.PG_PASSWORD ?? '';
export const PG_DATABASE = process.env.PG_DATABASE ?? '';
export const PG_PORT = parseInt(process.env.PG_PORT ?? '');

export const SERVER_PORT = process.env.SERVER_PORT || 4000;

export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID ?? '';
export const COGNITO_REGION = process.env.COGNITO_REGION ?? '';
