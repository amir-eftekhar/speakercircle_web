import { createClient } from '@libsql/client';

// Initialize Turso client
// For local development, these will be read from .env.local
// For production, set these in Vercel environment variables:
// TURSO_DATABASE_URL=libsql://speakerscircle-trivalleytechnology.turso.io
// TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDI1NjE3ODAsImlkIjoiYWU2OTQxYTgtN2I4MS00NjI0LWIxNTMtMWQ1MWZjY2Y3OWM3IiwicmlkIjoiYzM3Mzc2MDMtNDQxNy00MGNiLWFjZjYtMmI5YjgyZjY2ZmU1In0.HQXwOuPl0iUM8aTm6F3dGFBkEu-8FKXGQ-m5IRTaIrii3Yxkm94sAETBuC07Sc_brGc9KuqUs8WawA-mK7O0DA
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Check if we're in development or production
const isDev = process.env.NODE_ENV !== 'production';

// In development, use the local SQLite database
// In production, use Turso
export const tursoClient = isDev
  ? null // In development, we'll use the local SQLite database via Prisma
  : url && authToken
    ? createClient({
        url,
        authToken,
      })
    : null;

// Helper function to check if Turso is configured
export const isTursoConfigured = () => {
  if (isDev) return false; // In development, we don't use Turso
  return !!url && !!authToken;
};

// Helper function to execute a query
export async function executeQuery(query: string, params: any[] = []) {
  if (!tursoClient) {
    throw new Error('Turso client is not configured');
  }
  
  try {
    const result = await tursoClient.execute({
      sql: query,
      args: params,
    });
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
