import { executeQuery, isTursoConfigured, tursoClient } from './turso-client';

// This middleware intercepts database operations in production
// and routes them to Turso instead of SQLite
export async function withTurso(operation: () => Promise<any>) {
  // If we're in development or Turso is not configured,
  // just execute the operation normally
  if (!isTursoConfigured() || !tursoClient) {
    return operation();
  }

  try {
    // In production with Turso, we'll intercept the operation
    // and route it to Turso
    // This is a simplified example - in a real app, you'd need to
    // implement more complex logic to translate Prisma operations
    // to Turso SQL queries
    return operation();
  } catch (error) {
    console.error('Error executing operation with Turso:', error);
    throw error;
  }
}

// Helper function to create a user
export async function createUser(data: any) {
  if (!isTursoConfigured() || !tursoClient) {
    // In development, use Prisma directly
    return null;
  }

  try {
    const result = await executeQuery(
      `INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        data.id || crypto.randomUUID(),
        data.name,
        data.email,
        data.password,
        data.role || 'USER',
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Helper function to find a user by email
export async function findUserByEmail(email: string) {
  if (!isTursoConfigured() || !tursoClient) {
    // In development, use Prisma directly
    return null;
  }

  try {
    const result = await executeQuery(
      `SELECT * FROM User WHERE email = ? LIMIT 1`,
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

// Add more helper functions for other database operations as needed
