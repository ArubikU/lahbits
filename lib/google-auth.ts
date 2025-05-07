import { neon } from "@neondatabase/serverless";
import bcrypt from "./bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

const sql = neon(process.env.DATABASE_URL)

interface GoogleUserData {
  email: string;
  name: string;
  picture?: string;
  google_id: string;
}

export async function registerUserWithGoogle(userData: GoogleUserData) {
  const { email, name, picture, google_id } = userData;

  if (!email || !google_id) {
    return { success: false, message: "Email y Google ID son requeridos" };
  }

  try {
    // Verificar si el usuario ya existe por email
    const existingUserResult = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUserResult.length > 0) {
      // El usuario ya existe, actualizar información de Google si es necesario
      const user = existingUserResult[0];
      
      // Actualizar información de Google si no está establecida
      if (!user.google_id) {
        await sql`
          UPDATE users 
          SET google_id = ${google_id},
              profile_image_url = COALESCE(profile_image_url, ${picture}),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${user.id}
        `;
      }
      
      return { success: true, user };
    }

    // Generar un nombre de usuario único basado en el email
    const usernameBase = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 10000);
    const username = `${usernameBase}_${randomSuffix}`;
    
    // Crear el usuario
    const result = await sql`
      INSERT INTO users (
        username, 
        email, 
        password_hash, 
        full_name,
        nickname,
        profile_image_url,
        google_id,
        current_level, 
        current_xp, 
        total_xp, 
        gold, 
        prestige_level, 
        theme_id
      )
      VALUES (
        ${username}, 
        ${email}, 
        ${await bcrypt.hash(Math.random().toString(36), 10)}, 
        ${name},
        ${name.split(' ')[0]},
        ${picture || null},
        ${google_id},
        1, 
        0, 
        0, 
        0, 
        0, 
        2
      )
      RETURNING id
    `;

    const userId = result[0].id;

    // Crear categorías de stats por defecto
    await sql`
      INSERT INTO stat_categories (name, description, icon, color, user_id)
      VALUES 
        ('Trabajo', 'Tareas relacionadas con el trabajo', '💼', '#3b82f6', ${userId}),
        ('Estudios', 'Tareas relacionadas con los estudios', '📚', '#8b5cf6', ${userId}),
        ('Idiomas', 'Aprendizaje de idiomas', '🗣️', '#ec4899', ${userId}),
        ('Salud', 'Ejercicio y bienestar', '💪', '#10b981', ${userId}),
        ('Hobbies', 'Actividades recreativas', '🎨', '#f59e0b', ${userId})
    `;

    // Crear stats por defecto
    const categories = await sql`
      SELECT * FROM stat_categories WHERE user_id = ${userId}
    `;

    for (const category of categories) {
      if (category.name === "Trabajo") {
        await sql`
          INSERT INTO stats (category_id, user_id, name, current_value, max_value)
          VALUES 
            (${category.id}, ${userId}, 'Productividad', 0, 100),
            (${category.id}, ${userId}, 'Organización', 0, 100)
        `;
      } else if (category.name === "Estudios") {
        await sql`
          INSERT INTO stats (category_id, user_id, name, current_value, max_value)
          VALUES 
            (${category.id}, ${userId}, 'Matemáticas', 0, 100),
            (${category.id}, ${userId}, 'Ciencias', 0, 100),
            (${category.id}, ${userId}, 'Literatura', 0, 100)
        `;
      } else if (category.name === "Idiomas") {
        await sql`
          INSERT INTO stats (category_id, user_id, name, current_value, max_value)
          VALUES 
            (${category.id}, ${userId}, 'Inglés', 0, 100),
            (${category.id}, ${userId}, 'Español', 0, 100)
        `;
      } else if (category.name === "Salud") {
        await sql`
          INSERT INTO stats (category_id, user_id, name, current_value, max_value)
          VALUES 
            (${category.id}, ${userId}, 'Fuerza', 0, 100),
            (${category.id}, ${userId}, 'Resistencia', 0, 100),
            (${category.id}, ${userId}, 'Nutrición', 0, 100)
        `;
      } else if (category.name === "Hobbies") {
        await sql`
          INSERT INTO stats (category_id, user_id, name, current_value, max_value)
          VALUES 
            (${category.id}, ${userId}, 'Creatividad', 0, 100),
            (${category.id}, ${userId}, 'Música', 0, 100)
        `;
      }
    }

    // Obtener el usuario recién creado
    const userResult = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;

    return { success: true, user: userResult[0] };
  } catch (error) {
    console.error("Error registering user with Google:", error);
    return { success: false, message: "Error al registrar el usuario con Google" };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result[0] || null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}
