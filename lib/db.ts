import { Purchase, Streak, StreakBonus, Task, User } from "@/types"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import bcrypt from "./bcrypt"
import { calculateLevel, calculatePrestige } from "./xp"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

const sql = neon(process.env.DATABASE_URL)


export const db = drizzle(sql)

export async function getUserById(id: any) {
  const result = await sql`
  SELECT * FROM users WHERE id = ${id}
  `
  return result[0] || null
}


export async function getDevicesByUserId(id: any) {
  const result = await sql`
  SELECT * FROM user_devices WHERE user_id = ${id}
  `
  return result || []
}
export async function addDevice(userId: string, deviceId: string) {
  const result = await sql`
  INSERT INTO user_devices (user_id, device_id)
  VALUES (${userId}, ${deviceId})
  ON CONFLICT (user_id, device_id) DO NOTHING
  `
  return result[0] || null
}

export async function getAllNotiUserIds() {
  const result = await sql`
  SELECT id FROM users where is_email_notifications = true
  `
  return result.map((user) => user.id)
}
export async function getUserByUsername(username: string) {
  const result = await sql`
  SELECT * FROM users WHERE username = ${username}
  `
  return result[0] || null
}

export async function getUserStats(userId: string) {
  const result =  await sql`
  SELECT s.*, sc.name as category_name, sc.color as category_color, sc.icon as category_icon
  FROM stats s
  JOIN stat_categories sc ON s.category_id = sc.id
  WHERE s.user_id = ${userId}
  ORDER BY sc.name, s.name
  `


  const remappedResult = result.map(({ category_id, category_name, category_color, category_icon, ...stat }) => ({
    ...stat,
    category: {
      id: category_id,
      name: category_name,
      color: category_color,
      icon: category_icon,
    },
  }));

  return remappedResult;
}

export async function getUserTasks(userId: string, completed = false) {
  return await sql`
  SELECT t.*, s.name as stat_name, sc.name as category_name, sc.color as category_color
  FROM tasks t
  LEFT JOIN stats s ON t.stat_id = s.id
  LEFT JOIN stat_categories sc ON s.category_id = sc.id
  WHERE t.user_id = ${userId} AND t.is_completed = ${completed}
  ORDER BY t.deadline ASC NULLS LAST
  `
}

export async function getUserFailedAtNowTasks(userId: string) {
  //obtain all tasks and compare with current date. if task alredy have is_failed = true, then do recover it, if not, then set is_failed = true
  const result = await sql`
  SELECT * FROM tasks WHERE user_id = ${userId} AND is_completed = false AND is_failed = false AND deadline < CURRENT_TIMESTAMP
  ` as Task[]
  const tasks = result.map((task) => {
    return { ...task, is_failed: true }
  })
  await sql`
  UPDATE tasks SET is_failed = true, is_completed = true WHERE user_id = ${userId} AND is_completed = false AND is_failed = false AND deadline < CURRENT_TIMESTAMP
  `

  const xpToRevoke = Math.ceil(tasks.reduce((acc, task) => {
    const taskXp = task.xp_reward * (3 / 4)
    return acc + taskXp
  }
    , 0))
  await sql`
  UPDATE users SET current_xp = current_xp - ${xpToRevoke} WHERE id = ${userId}
  `
  return tasks
}
export async function getThemeById(id: number) {
  const result = await sql`
  SELECT * FROM themes WHERE id = ${id}
  `
  return result[0] || null
}

export async function getLevelInfo(level: number, prestige = 0) {
  const result = await sql`
  SELECT * FROM level_thresholds 
  WHERE level = ${level} AND prestige_required <= ${prestige}
  `
  return result[0] || null
}

export async function getNextLevelInfo(currentLevel: number, prestige = 0) {
  const result = await sql`
  SELECT * FROM level_thresholds 
  WHERE (level > ${currentLevel} AND prestige_required <= ${prestige})
  OR prestige_required > ${prestige}
  ORDER BY prestige_required ASC, level ASC
  LIMIT 1
  `
  return result[0] || null
}

export async function getUserStreak(userId: string) {
  const result = await sql`
  SELECT * FROM streaks WHERE user_id = ${userId}
  `
  return result[0] || null
}

export async function getUserStreakBonuses(userId: string) {
  return await sql`
  SELECT * FROM streak_bonuses 
  WHERE user_id = ${userId}
  ORDER BY min_days ASC
  `
}

export async function getMarketplaceItems(userId: string, includeInactive = false) {
  if (includeInactive) {
    return await sql`
  SELECT * FROM marketplace_items 
  WHERE user_id = ${userId}
  ORDER BY created_at DESC
    `
  }

  return await sql`
  SELECT * FROM marketplace_items 
  WHERE user_id = ${userId} AND is_active = true
  ORDER BY created_at DESC
  `
}

export async function getUserPurchases(userId: string) {
  return await sql`
    SELECT ph.*, mi.name as item_name, mi.description as item_description
    FROM purchase_history ph
  LEFT JOIN marketplace_items mi ON ph.item_id = mi.id
  WHERE ph.user_id = ${userId}
  ORDER BY ph.purchased_at DESC
  `
}

export async function getMarketplaceItemById(itemId: number) {
  const result = await sql`
    SELECT * FROM marketplace_items WHERE id = ${itemId}
    `
  return result[0] || null
}

export async function getUserStatCategories(userId: string) {
  return await sql`
  SELECT * FROM stat_categories
  WHERE user_id = ${userId}
  ORDER BY name
  `
}

export async function registerUser(registerData: {}) {
  let { username, password, nickname,birthDate ,notifications} = registerData as {
    username: string
    password: string
    nickname?: string
    birthDate?: string
    notifications?: boolean
  }

  if (!username || !password) {
    return { success: false, message: "Usuario y contraseña son requeridos" }
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await getUserByUsername(username)

    if (existingUser) {
      return { success: false, message: "El nombre de usuario ya está en uso" }
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    if(!birthDate){
      const today = new Date()
      birthDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today
        .getDate()
        .toString()
        .padStart(2, "0")}`
    }
    if(!notifications){
      notifications = true
    }

    // Crear el usuario
    const result = await sql`
        INSERT INTO users (username, password_hash, nickname, current_level, current_xp, total_xp, gold, prestige_level, theme_id, birth_date, notifications)
        VALUES ( ${username}, ${passwordHash}, ${nickname}, 1, 0, 0, 0, 0, 2, ${birthDate}, ${notifications})
        RETURNING id
      `

    const userId = result[0].id

    // Crear categorías de stats por defecto
    await sql`
        INSERT INTO stat_categories (name, description, icon, color, user_id)
        VALUES 
          ('Trabajo', 'Tareas relacionadas con el trabajo', '💼', '#3b82f6', ${userId}),
          ('Estudios', 'Tareas relacionadas con los estudios', '📚', '#8b5cf6', ${userId}),
          ('Idiomas', 'Aprendizaje de idiomas', '🗣️', '#ec4899', ${userId}),
          ('Salud', 'Ejercicio y bienestar', '💪', '#10b981', ${userId}),
          ('Hobbies', 'Actividades recreativas', '🎨', '#f59e0b', ${userId})
      `

    // Crear stats por defecto
    const categories = await sql`
        SELECT * FROM stat_categories WHERE user_id = ${userId}
      `

    for (const category of categories) {
      if (category.name === "Trabajo") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Productividad', 0, 100),
              (${category.id}, ${userId}, 'Organización', 0, 100)
          `
      } else if (category.name === "Estudios") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Matemáticas', 0, 100),
              (${category.id}, ${userId}, 'Ciencias', 0, 100),
              (${category.id}, ${userId}, 'Literatura', 0, 100)
          `
      } else if (category.name === "Idiomas") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Inglés', 0, 100),
              (${category.id}, ${userId}, 'Español', 0, 100)
          `
      } else if (category.name === "Salud") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Fuerza', 0, 100),
              (${category.id}, ${userId}, 'Resistencia', 0, 100),
              (${category.id}, ${userId}, 'Nutrición', 0, 100)
          `
      } else if (category.name === "Hobbies") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Creatividad', 0, 100),
              (${category.id}, ${userId}, 'Música', 0, 100)
          `
      }
    }

    const user = await getUserById(userId)
    if (!user) {
      return { success: false, message: "Error al crear el usuario" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Error al registrar el usuario" }
  }
}


export async function createSession(userId: string, browser?: string, mac?: string, expiry?: Date) {
  if (!userId) {
    throw new Error("User ID is required")
  }
  if (!expiry) {
    expiry = new Date(Date.now() + 60 * 60 * 1000 * 12) // 12 hour from now
  }

  const result = await sql`
    INSERT INTO sessions (user_id, browser, mac, expiry)
    VALUES (${userId}, ${browser}, ${mac}, ${expiry})
    RETURNING *
  `
  return result[0]

}
export async function removeSession(sessionId: string) {
  const result = await sql`
    DELETE FROM sessions WHERE id = ${sessionId}
  `
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE username = ${email}
  `
  
  return result[0] || null
}

export async function registerUserWithGoogle(userData: { 
  email: string; 
  name: string; 
  picture?: string; 
  google_id: string; 
}) {
  const { email, name, picture, google_id } = userData

  try {
    // Verificar si el usuario ya existe por username (email)
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      // El usuario ya existe, actualizar información de Google si es necesario
      if (!existingUser.google_id) {
        await sql`
          UPDATE users 
          SET google_id = ${google_id},
              profile_image_url = COALESCE(profile_image_url, ${picture})
          WHERE id = ${existingUser.id}
        `
      }
      
      return { success: true, user: existingUser }
    }

    // Usar el email completo como username
    const username = email
    
    // Crear el usuario
    const result = await sql`
      INSERT INTO users (
        username, 
        password_hash, 
        full_name,
        nickname,
        profile_image_url,
        current_level, 
        current_xp, 
        total_xp, 
        gold, 
        prestige_level, 
        theme_id
      )
      VALUES (
        ${username}, 
        ${await bcrypt.hash(google_id, 10)}, 
        ${name},
        ${name.split(' ')[0]},
        ${picture || null},
        1, 
        0, 
        0, 
        0, 
        0, 
        2
      )
      RETURNING id
    `

    const userId = result[0].id

    // Crear categorías de stats por defecto
    await sql`
      INSERT INTO stat_categories (name, description, icon, color, user_id)
      VALUES 
        ('Trabajo', 'Tareas relacionadas con el trabajo', '💼', '#3b82f6', ${userId}),
        ('Estudios', 'Tareas relacionadas con los estudios', '📚', '#8b5cf6', ${userId}),
        ('Idiomas', 'Aprendizaje de idiomas', '🗣️', '#ec4899', ${userId}),
        ('Salud', 'Ejercicio y bienestar', '💪', '#10b981', ${userId}),
        ('Hobbies', 'Actividades recreativas', '🎨', '#f59e0b', ${userId})
    `

    // Crear stats por defecto
    const categories = await sql`
        SELECT * FROM stat_categories WHERE user_id = ${userId}
      `

    for (const category of categories) {
      if (category.name === "Trabajo") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Productividad', 0, 100),
              (${category.id}, ${userId}, 'Organización', 0, 100)
          `
      } else if (category.name === "Estudios") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Matemáticas', 0, 100),
              (${category.id}, ${userId}, 'Ciencias', 0, 100),
              (${category.id}, ${userId}, 'Literatura', 0, 100)
          `
      } else if (category.name === "Idiomas") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Inglés', 0, 100),
              (${category.id}, ${userId}, 'Español', 0, 100)
          `
      } else if (category.name === "Salud") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Fuerza', 0, 100),
              (${category.id}, ${userId}, 'Resistencia', 0, 100),
              (${category.id}, ${userId}, 'Nutrición', 0, 100)
          `
      } else if (category.name === "Hobbies") {
        await sql`
            INSERT INTO stats (category_id, user_id, name, current_value, max_value)
            VALUES 
              (${category.id}, ${userId}, 'Creatividad', 0, 100),
              (${category.id}, ${userId}, 'Música', 0, 100)
          `
      }
    }

    // Obtener el usuario recién creado
    const newUser = await getUserById(userId)

    return { success: true, user: newUser }
  } catch (error) {
    console.error("Error registering user with Google:", error)
    return { success: false, message: "Error al registrar el usuario con Google" }
  }
}

export async function loginWithGoogle(userData:{
  email: string;
  name: string;
  picture?: string;
  google_id: string;
}) {
  const { email, name, picture, google_id } = userData

  // Verificar si el usuario ya existe por username (email)
  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    return { success: false, message: "Usuario no encontrado" }
  }

  //password_hash is the google_id
  const passwordMatch = await bcrypt.compare(google_id, existingUser.password_hash)
  if (!passwordMatch) {
    return { success: false, message: "Contraseña incorrecta" }
  }
  //verify if existingUser profile_image_url is a google image so we can update it
  if(picture){

  if (existingUser.profile_image_url !== picture) {
    const currentImage = existingUser.profile_image_url
    if (currentImage && currentImage.startsWith("https://lh3.googleusercontent.com/")) {
      existingUser.profile_image_url = picture
      await sql`
        UPDATE users 
        SET profile_image_url = ${picture}
        WHERE id = ${existingUser.id}
      `
    }
  }
  }
  if(name){
    if (existingUser.nickname !== name.split(" ")[0]) {
      existingUser.nickname = name.split(" ")[0]
      await sql`
        UPDATE users 
        SET nickname = ${name.split(" ")[0]}
        WHERE id = ${existingUser.id}
      `
    }
  }

  return { success: true, user: existingUser }
}


export async function getUserBySessionId(sessionId: string) {
  const result = await sql`
    SELECT * FROM sessions WHERE id = ${sessionId}
  `
  const session = result[0]
  if (!session) {
    return null
  }
  if(session.expiry){

    const expiry = new Date(session.expiry)
    if (expiry < new Date()) {
      sql`
        DELETE FROM sessions WHERE id = ${sessionId}
      `
      return null
    }
  }
  const userResult = await sql`
    SELECT * FROM users WHERE id = ${session.user_id}
  ` as User[]
  return userResult[0] || null

}

export async function deleteSession(sessionId: number) {
  await sql`
    DELETE FROM sessions WHERE id = ${sessionId}
  `
}


interface UserProfileData {
  userId: string;
  nickname?: string;
  fullName?: string;
  themeId?: number;
  birthDate?: string
  profileImage?: string;
  gender?: string;
  isStudent?: boolean;
  isWorking?: boolean;
  isEmailNotifications?: boolean;
}

export async function updateUserProfile(profileData: UserProfileData) {
  const { userId, nickname, fullName, birthDate, themeId, profileImage, gender, isStudent, isWorking,isEmailNotifications } = profileData;

  if (!userId) {
    return { success: false, message: "ID de usuario requerido" }
  }

  let profileImageUrl
  if (profileImage) {
    profileImageUrl = profileImage
  }


  try {

    const fields: string[] = []
    const values: any[] = []
    let i = 1 // contador de $n

    if (nickname) {
      fields.push(`nickname = $${i++}`)
      values.push(nickname)
    }

    if (fullName) {
      fields.push(`full_name = $${i++}`)
      values.push(fullName)
    }

    if (themeId) {
      if (!isNaN(themeId)) {
        fields.push(`theme_id = $${i++}`)
        values.push(themeId)
      }
    }

    if (profileImageUrl) {
      fields.push(`profile_image_url = $${i++}`)
      values.push(profileImageUrl)
    }
    if (birthDate) {
      fields.push(`birth_date = $${i++}`)
      values.push(Date.parse(birthDate))
    }


    if (gender) {
      fields.push(`gender = $${i++}`)
      values.push(gender)
    }

    if (isStudent !== undefined) {
      fields.push(`is_student = $${i++}`)
      values.push(isStudent)
    }
    if (isWorking !== undefined) {
      fields.push(`is_working = $${i++}`)
      values.push(isWorking)
    }
    if (isEmailNotifications !== undefined) {
      fields.push(`is_email_notifications = $${i++}`)
      values.push(isEmailNotifications)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (fields.length > 0) {
      const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${i}
      `
      values.push(userId)

      await sql.query(query, values)
    }
    let updatedUser = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `

    return { success: true, result: updatedUser[0] }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, message: "Error al actualizar el perfil" }
  }
}

export async function createTask(taskData: {
  userId: string;
  title: string;
  description: string;
  xpReward: number;
  statId?: number | null;
  deadline?: string | Date | null;
}) {
  const { userId, title, description, xpReward, statId = null } = taskData
  const deadlineStr = taskData.deadline as string | undefined
  const deadline = deadlineStr ? new Date(deadlineStr) : null

  if (!userId || !title || !xpReward) {
    return { success: false, message: "Faltan campos requeridos" }
  }

  try {
    const result = await sql`
      INSERT INTO tasks (user_id, stat_id, title, description, xp_reward, deadline, is_completed, is_failed)
      VALUES (${userId}, ${statId}, ${title}, ${description}, ${xpReward}, ${deadline}, false, false)
      RETURNING *
    `
    return { success: true, result: result[0] }

  } catch (error) {
    console.error("Error creating task:", error)
    return { success: false, message: "Error al crear la tarea" }
  }
}

export async function saveTaskPin(pin: string, userid: string, newPin?: string) {
  //ping should be 4 digits number
  if (!/^\d{4}$/.test(pin)) {
    return { success: false, message: "El PIN debe tener 4 dígitos" }
  }
  if(newPin && !/^\d{4}$/.test(newPin)) {
    return { success: false, message: "El nuevo PIN debe tener 4 dígitos" }
  }
  if (newPin) {
    const hashedPin = await bcrypt.hash(newPin, 10)
    //verify the old pin
    const result = await sql`
      SELECT * FROM tasks_user_pin WHERE id = ${userid}
    `
    const pinResult = result[0]
    if (!pinResult) {
      return { success: false, message: "PIN no encontrado" }
    }
    const isMatch = await bcrypt.compare(pin, pinResult.pin)
    if (!isMatch) {
      return { success: false, message: "PIN incorrecto" }
    }
    //update the pin
    await sql`
      UPDATE tasks_user_pin SET pin = ${hashedPin} WHERE id = ${userid}
    `
    return { success: true, message: "PIN actualizado correctamente" }
  }
  //check if the user already has a pin 

  const hashedPin = await bcrypt.hash(pin, 10)
  await sql`
    INSERT INTO tasks_user_pin (id, pin) 
    VALUES (${userid}, ${hashedPin})
    ON CONFLICT DO NOTHING

  `
  return { success: true, message: "PIN guardado correctamente" }
}

export async function validateTaskPin(pin: string, userId: string) {
  //ping should be 4 digits number
  if (!/^\d{4}$/.test(pin)) {
    return { success: false, message: "El PIN debe tener 4 dígitos" }
  }

  const result = await sql`
    SELECT * FROM tasks_user_pin WHERE id = ${userId}
  `
  const pinResult = result[0]
  if (!pinResult) {
    return { success: false, message: "PIN no encontrado" }
  }
  const isMatch = await bcrypt.compare(pin, pinResult.pin)
  if (!isMatch) {
    return { success: false, message: "PIN incorrecto" }
  }
  return { success: true }
}

export async function hasPin(userId: string) {
  const result = await sql`
    SELECT * FROM tasks_user_pin WHERE id = ${userId}
  `
  return result.length > 0
}

export async function completeTask(taskId: number) {
  try {
    // Obtener información de la tarea
    const taskResult = await sql`
      SELECT * FROM tasks WHERE id = ${taskId}
    `

    if (taskResult.length === 0) {
      return { success: false, message: "Tarea no encontrada" }
    }

    const task = taskResult[0]
    const userId = task.user_id
    let xpReward = task.xp_reward
    const statId = task.stat_id

    //verifica si se paso de la fecha de entrega
    if (task.deadline && new Date(task.deadline) < new Date()) {

      xpReward = Math.ceil(xpReward * (3 / 4))

      await sql`
        UPDATE tasks SET is_failed = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${taskId}
      `
    await sql`
      INSERT INTO task_history (task_id, user_id, action, xp_change, gold_change)
      VALUES (${taskId}, ${userId}, 'failed', ${xpReward*-1}, ${0})
    `
    await sql`
      UPDATE users 
      SET current_xp = current_xp - ${xpReward}, 
          total_xp = total_xp + ${xpReward},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
    // Recalcular nivel del usuario
    const userResult = await sql`
      SELECT total_xp, prestige_level FROM users WHERE id = ${userId}
    `

    const totalXp = userResult[0].total_xp
    const prestigeLevel = userResult[0].prestige_level

    const newLevel = await calculateLevel(totalXp-xpReward, prestigeLevel)
    const newPrestige = calculatePrestige(newLevel)
    await sql`
      UPDATE users SET current_level = ${newLevel}, prestige_level = ${newPrestige} WHERE id = ${userId}
    `

    return {
      success: true,
      new_xp: totalXp,
      xp_reward: -xpReward,
      new_level: newLevel,
      streak_info: null,
      failed: true,
    }

    }

    // Marcar la tarea como completada
    await sql`
      UPDATE tasks SET is_completed = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId}
    `

    // Registrar en el historial
    await sql`
      INSERT INTO task_history (task_id, user_id, action, xp_change, gold_change)
      VALUES (${taskId}, ${userId}, 'completed', ${xpReward}, ${xpReward})
    `

    // Actualizar la racha del usuario
    const streakResult = await updateStreak(userId)
    let totalXpReward = xpReward

    // Aplicar bonificación de XP si existe
    if (streakResult.success && (streakResult.xp_bonus || 0) > 0) {
      totalXpReward += (streakResult.xp_bonus || 0)
    }

    // Actualizar XP y oro del usuario
    await sql`
      UPDATE users 
      SET current_xp = current_xp + ${totalXpReward}, 
          total_xp = total_xp + ${totalXpReward},
          gold = gold + ${totalXpReward},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `

    // Si la tarea está asociada a un stat, actualizar su valor
    if (statId) {
      await sql`
        UPDATE stats 
        SET current_value = current_value + ${Math.ceil(xpReward / 10)},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${statId}
      `
    }

    // Recalcular nivel del usuario
    const userResult = await sql`
      SELECT total_xp, prestige_level FROM users WHERE id = ${userId}
    `

    const totalXp = userResult[0].total_xp
    const prestigeLevel = userResult[0].prestige_level

    const newLevel = await calculateLevel(totalXp+totalXpReward, prestigeLevel)
    const newPrestige = calculatePrestige(newLevel)
    await sql`
      UPDATE users SET current_level = ${newLevel}, prestige_level = ${newPrestige} WHERE id = ${userId}
    `

    return {
      success: true,
      new_xp: totalXp ,
      xp_reward: xpReward,
      new_level: newLevel,
      failed: false,
      streak_info: streakResult.success
        ? {
          current_streak: streakResult.current_streak,
          xp_bonus: streakResult.xp_bonus,
        }
        : null,
    }
  } catch (error) {
    console.error("Error completing task:", error)
    return { success: false, message: "Error al completar la tarea" }
  }
}

export async function deleteTask(taskId: number) {
  try {
    // Obtener información de la tarea
    const taskResult = await sql`
      SELECT * FROM tasks WHERE id = ${taskId}
    `

    if (taskResult.length === 0) {
      return { success: false, message: "Tarea no encontrada" }
    }

    const task = taskResult[0]
    const userId = task.user_id

    // Marcar la tarea como eliminada
    await sql`
      DELETE FROM tasks WHERE id = ${taskId}
    `

    // Registrar en el historial
    await sql`
      INSERT INTO task_history (task_id, user_id, action)
      VALUES (${taskId}, ${userId}, 'deleted')
    `

    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, message: "Error al eliminar la tarea" }
  }
}

export async function markTaskAsFavorite(taskId: number, userId: string,isFavorite =true) {
  try {
    // Verificar si la tarea ya está marcada como favorita
    const taskResult = await sql`
      SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${userId}
    `

    if (taskResult.length === 0) {
      return { success: false, message: "Tarea no encontrada" }
    }

    const task = taskResult[0]

    // Alternar el estado de favorito

    await sql`
      UPDATE tasks SET favorite = ${isFavorite}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId}
    `

    return { success: true, result: { ...task, favorite: isFavorite } }
  } catch (error) {
    console.error("Error marking task as favorite:", error)
    return { success: false, message: "Error al marcar la tarea como favorita" }
  }
}


export async function updateStreak(userId: string) {
  try {
    // Obtener la racha actual del usuario
    const streakResult = await sql`
      SELECT * FROM streaks WHERE user_id = ${userId}
    `;

    let streak;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear la hora

    if (streakResult.length === 0) {
      // Crear una nueva racha si no existe
      await sql`
        INSERT INTO streaks (user_id, current_streak, max_streak, last_activity_date)
        VALUES (${userId}, 1, 1, ${today})
      `;
      streak = { current_streak: 1, max_streak: 1 };
    } else {
      const result = streakResult[0];

      // Verificación segura de campos
      const current_streak = result.current_streak ?? 1;
      const max_streak = result.max_streak ?? 1;
      const last_activity_date = result.last_activity_date ?? today;

      streak = { current_streak, max_streak };

      const lastActivity = new Date(last_activity_date);
      lastActivity.setHours(0, 0, 0, 0); // Resetear la hora de la última actividad

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1); // Calcular la fecha de ayer

      if (lastActivity.getTime() === today.getTime()) {
        // Si la última actividad fue hoy, no cambia la racha
        return { success: true, current_streak: current_streak, updated: false };
      } else if (lastActivity.getTime() === yesterday.getTime()) {
        // Si la última actividad fue ayer, incrementar la racha
        const newStreak = current_streak + 1;
        const newMaxStreak = Math.max(newStreak, max_streak);

        await sql`
          UPDATE streaks 
          SET current_streak = ${newStreak}, 
              max_streak = ${newMaxStreak}, 
              last_activity_date = ${today},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;
        streak = { current_streak: newStreak, max_streak: newMaxStreak };
      } else {
        // Si fue hace más de 1 día, reiniciar la racha
        await sql`
          UPDATE streaks 
          SET current_streak = 1, 
              last_activity_date = ${today},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;
        streak = { current_streak: 1, max_streak };
      }
    }

    // Obtener bonificación de racha si corresponde
    const bonusResult = await sql`
      SELECT * FROM streak_bonuses 
      WHERE user_id = ${userId} 
      AND min_days <= ${streak.current_streak} 
      AND (max_days IS NULL OR max_days >= ${streak.current_streak})
      ORDER BY xp_bonus DESC
      LIMIT 1
    `;

    let xp_bonus = 0;
    if (bonusResult.length > 0) {
      xp_bonus = bonusResult[0].xp_bonus;
    }

    return {
      success: true,
      current_streak: streak.current_streak,
      max_streak: streak.max_streak,
      xp_bonus,
      updated: true,
    };
  } catch (error) {
    console.error("Error updating streak:", error);
    return { success: false, message: "Error al actualizar la racha" };
  }
}


export async function recoverStreak(userId: string) {
  try {
    // Obtener la racha y el oro del usuario
    const [streakResult, userResult]: [Streak[],User[]] = await Promise.all([
      sql`SELECT * FROM streaks WHERE user_id = ${userId}`,
      sql`SELECT gold FROM users WHERE id = ${userId}`,
    ]) as any;

    if (streakResult.length === 0) {
      return { success: false, message: "No se encontró la racha del usuario" };
    }

    const streak = streakResult[0];
    const user = userResult[0];

    // Fallback de 1000 de oro si no se encuentra recovery_cost
    const recoveryCost = streak.recovery_cost ?? 1000;

    if (user.gold < recoveryCost) {
      return { success: false, message: "No tienes suficiente oro para recuperar tu racha" };
    }

    // Recuperar la racha máxima
    await sql`
      UPDATE streaks 
      SET current_streak = max_streak, 
          last_activity_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    // Restar el oro
    await sql`
      UPDATE users 
      SET gold = gold - ${recoveryCost},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
    streak.current_streak = streak.max_streak
    streak.recovery_cost = recoveryCost
    return {
      ...streak,
      success: true
    };
  } catch (error) {
    console.error("Error recovering streak:", error);
    return { success: false, message: "Error al recuperar la racha" };
  }
}

export async function updateStreakSettings(data: {
  userId: string;
  recoveryCost: number;
  bonusRanges: StreakBonus[];
}) {
  const { userId, recoveryCost, bonusRanges: ranges } = data

  try {
    // Actualizar el costo de recuperación
    await sql`
      UPDATE streaks 
      SET recovery_cost = ${recoveryCost},
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `

    // Eliminar bonificaciones existentes
    await sql`
      DELETE FROM streak_bonuses WHERE user_id = ${userId}
    `

    // Insertar nuevas bonificaciones
    for (const range of ranges) {
      await sql`
        INSERT INTO streak_bonuses (user_id, min_days, max_days, xp_bonus)
        VALUES (${userId}, ${range.min_days}, ${range.max_days || null}, ${range.xp_bonus})
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating streak settings:", error)
    return { success: false, message: "Error al actualizar la configuración de racha" }
  }
}

export async function createMarketplaceItem(itemData: {
  userId: string;
  name: string;
  description: string;
  price: number;
  maxPurchases?: number | null;
}) {
  const { userId, name, description, price, maxPurchases = null } = itemData

  if (!userId || !name || !price) {
    return { success: false, message: "Faltan campos requeridos" }
  }

  try {
    const result = await sql`
      INSERT INTO marketplace_items (user_id, name, description, price, max_purchases, times_purchased)
      VALUES (${userId}, ${name}, ${description}, ${price}, ${maxPurchases}, 0)
      RETURNING *
    `

    return { success: true, result: result[0] }
  } catch (error) {
    console.error("Error creating marketplace item:", error)
    return { success: false, message: "Error al crear el producto" }
  }
}

export async function updateMarketplaceItem(itemData: {
  userId: string;
  itemId: number;
  name: string;
  description: string;
  price: number;
  maxPurchases?: number | null;
  isActive?: boolean
}) {
  const { userId,itemId, name, description, price, maxPurchases = null, isActive } = itemData
  if(!userId || !itemId){
    return { success: false, message: "Faltan campos requeridos" }
  }
  try {
    const fields: string[] = []
    const values: any[] = []
    let i = 1 // contador de $n

    if (name) {
      fields.push(`name = $${i++}`)
      values.push(name)
    }

    if (description) {
      fields.push(`description = $${i++}`)
      values.push(description)
    }

    if (price) {
      fields.push(`price = $${i++}`)
      values.push(price)
    }

    if (maxPurchases !== undefined) {
      fields.push(`max_purchases = $${i++}`)
      values.push(maxPurchases)
    }

    if (isActive !== undefined) {
      fields.push(`is_active = $${i++}`)
      values.push(isActive)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (fields.length > 0) {
      const query = `
        UPDATE marketplace_items
        SET ${fields.join(", ")}
        WHERE id = $${i} AND user_id = ${userId}
      `
      values.push(itemId)

      await sql.query(query, values)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating marketplace item:", error)
    return { success: false, message: "Error al actualizar el producto" }
  }
}

export async function purchaseMarketplaceItem(itemId: number, userId: string) {
  try {
    // Obtener información del producto y usuario
    const [itemResult, userResult] = await Promise.all([
      sql`SELECT * FROM marketplace_items WHERE id = ${itemId}`,
      sql`SELECT gold FROM users WHERE id = ${userId}`,
    ])

    if (itemResult.length === 0) {
      return { success: false, message: "Producto no encontrado" }
    }

    const item = itemResult[0]
    const user = userResult[0]

    // Verificar si el producto está activo
    if (!item.is_active) {
      return { success: false, message: "Este producto ya no está disponible" }
    }

    // Verificar si se alcanzó el límite de compras
    if (item.max_purchases !== null && item.times_purchased >= item.max_purchases) {
      return { success: false, message: "Se ha alcanzado el límite de compras para este producto" }
    }

    // Verificar si el usuario tiene suficiente oro
    if (user.gold < item.price) {
      return { success: false, message: "No tienes suficiente oro para comprar este producto" }
    }

      // Actualizar el oro del usuario
      await sql`
        UPDATE users 
        SET gold = gold - ${item.price},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `

      // Actualizar el contador de compras del producto
      await sql`
        UPDATE marketplace_items 
        SET times_purchased = times_purchased + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${itemId}
      `

      // Registrar la compra en el historial
    const purchase =  await sql`
        INSERT INTO purchase_history (user_id, item_id, price_paid)
        VALUES (${userId}, ${itemId}, ${item.price})
        RETURNING *
      `
    //
    //export type Purchase = {
    //  id: number
    //  user_id: string
    //  item_id: number
    //  price_paid: number
    //  purchased_at: Date
    //  item?: MarketplaceItem
    //}
    const result: Purchase = {
      id: purchase[0].id,
      user_id: purchase[0].user_id,
      item_id: purchase[0].item_id,
      price_paid: purchase[0].price_paid,
      purchased_at: purchase[0].purchased_at,
      item: {
        user_id: item.user_id,
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        max_purchases: item.max_purchases,
        times_purchased: item.times_purchased + 1, // Incrementar el contador de compras
        is_active: item.is_active,
      },
    }

    return { success: true, result }
  } catch (error) {
    console.error("Error purchasing item:", error)
    return { success: false, message: "Error al realizar la compra" }
  }
}

export async function toggleMarketplaceItem(itemId: number, userId: string) {
  try {
    const result = await sql`
      UPDATE marketplace_items 
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return { success: false, message: "Producto no encontrado" }
    }

    //revalidatePath("/marketplace")
    return { success: true, isActive: result[0].is_active, result: result[0] }
  } catch (error) {
    console.error("Error toggling marketplace item:", error)
    return { success: false, message: "Error al cambiar el estado del producto" }
  }
}
export async function deleteMarketplaceItem(itemId: number, userId: string) {
  try {
    // Verificar si el producto pertenece al usuario
    const itemResult = await sql`
      SELECT * FROM marketplace_items WHERE id = ${itemId} AND user_id = ${userId}
    `

    if (itemResult.length === 0) {
      return { success: false, message: "Producto no encontrado o no tienes permiso para eliminarlo" }
    }

    // Eliminar el producto
    await sql`
      DELETE FROM marketplace_items WHERE id = ${itemId}
    `

    //revalidatePath("/marketplace")
    return { success: true }
  } catch (error) {
    console.error("Error deleting marketplace item:", error)
    return { success: false, message: "Error al eliminar el producto" }
  }
}


// Añadir estas funciones al archivo de acciones existente

export async function createCategory(categoryData: {
  userId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}) {
  const { userId, name, description, icon, color } = categoryData

  if (!userId || !name) {
    return { success: false, message: "Faltan campos requeridos" }
  }

  try {
    const result = await sql`
      INSERT INTO stat_categories (user_id, name, description, icon, color)
      VALUES (${userId}, ${name}, ${description}, ${icon}, ${color})
      RETURNING *
    `


    //revalidatePath("/settings/categories")
    return { success: true, result }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, message: "Error al crear la categoría" }
  }
}

export async function updateCategory(categoryData: {
  categoryId: number;
  userId: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}) {
  const { categoryId, userId, name, description, icon, color } = categoryData;

  try {
    // Verificar que la categoría pertenece al usuario
    const categoryResult = await sql`
      SELECT * FROM stat_categories WHERE id = ${categoryId} AND user_id = ${userId}
    `;

    if (categoryResult.length === 0) {
      return { success: false, message: "Categoría no encontrada o no tienes permiso para actualizarla" };
    }

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1; // contador de $n
    
    if (name) {
      fields.push(`name = $${i++}`);
      values.push(name);
    }

    if (description) {
      fields.push(`description = $${i++}`);
      values.push(description);
    }

    if (icon) {
      fields.push(`icon = $${i++}`);
      values.push(icon);
    }

    if (color) {
      fields.push(`color = $${i++}`);
      values.push(color);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length > 0) {
      const query = `
        UPDATE stat_categories
        SET ${fields.join(", ")}
        WHERE id = $${i}
      `;
      values.push(categoryId);
      //replace the values in the query
      for (let j = 0; j < values.length; j++) {
        query.replace(`$${j + 1}`, values[j]);
      }
      sql.query(query,values)
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, message: "Error al actualizar la categoría" };
  }
}

export async function deleteCategory(categoryData: {
  categoryId: number, userId: string
}) {
  const { categoryId, userId } = categoryData
  try {
    // Verificar que la categoría pertenece al usuario
    const categoryResult = await sql`
      SELECT * FROM stat_categories WHERE id = ${categoryId} AND user_id = ${userId}
    `

    if (categoryResult.length === 0) {
      return { success: false, message: "Categoría no encontrada o no tienes permiso para eliminarla" }
    }

    // Eliminar la categoría (las estadísticas asociadas se eliminarán en cascada)
    await sql`
      DELETE FROM stat_categories WHERE id = ${categoryId}
    `
    await sql`
      DELETE FROM stats WHERE category_id = ${categoryId}
    `

    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, message: "Error al eliminar la categoría" }
  }
}

export async function createStat(statData: {
  userId: string;
  name: string;
  categoryId: number;
  currentValue: number;
  maxValue: number;
}) {
  const { userId, name, categoryId, currentValue, maxValue } = statData

  if (!userId || !name || !categoryId) {
    return { success: false, message: "Faltan campos requeridos" }
  }

  try {
    // Verificar que la categoría pertenece al usuario
    const categoryResult = await sql`
      SELECT * FROM stat_categories WHERE id = ${categoryId} AND user_id = ${userId}
    `

    if (categoryResult.length === 0) {
      return { success: false, message: "Categoría no encontrada o no tienes permiso para usarla" }
    }

    const result = await sql`
      INSERT INTO stats (user_id, category_id, name, current_value, max_value)
      VALUES (${userId}, ${categoryId}, ${name}, ${currentValue}, ${maxValue})
      RETURNING *
    `

    return { success: true, result }
  } catch (error) {
    console.error("Error creating stat:", error)
    return { success: false, message: "Error al crear la estadística" }
  }
}

export async function updateStat(statData: {
  statId: number;
  userId: string;
  name?: string;
  currentValue?: number;
  maxValue?: number;
}) {
  const { statId, userId, name, currentValue, maxValue } = statData;

  try {
    // Verificar que la estadística pertenece al usuario
    const statResult = await sql`
      SELECT * FROM stats WHERE id = ${statId} AND user_id = ${userId}
    `;

    if (statResult.length === 0) {
      return { success: false, message: "Estadística no encontrada o no tienes permiso para actualizarla" };
    }

    const fields: string[] = [];
    const values: any[] = [];
    let i = 1; // contador de $n

    if (name) {
      fields.push(`name = $${i++}`);
      values.push(name);
    }

    if (currentValue !== undefined) {
      fields.push(`current_value = $${i++}`);
      values.push(currentValue);
    }

    if (maxValue !== undefined) {
      fields.push(`max_value = $${i++}`);
      values.push(maxValue);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length > 0) {
      const query = `
        UPDATE stats
        SET ${fields.join(", ")}
        WHERE id = $${i}
      `;
      values.push(statId);

      await sql.query(query, values);
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating stat:", error);
    return { success: false, message: "Error al actualizar la estadística" };
  }
}

export async function deleteStat(data: {statId: number, userId: string}) {
  const { statId, userId } = data
  try {
    // Verificar que la estadística pertenece al usuario
    const statResult = await sql`
      SELECT * FROM stats WHERE id = ${statId} AND user_id = ${userId}
    `

    if (statResult.length === 0) {
      return { success: false, message: "Estadística no encontrada o no tienes permiso para eliminarla" }
    }

    // Eliminar la estadística
    await sql`
      DELETE FROM stats WHERE id = ${statId}
    `

    //revalidatePath("/settings/stats")
    //revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting stat:", error)
    return { success: false, message: "Error al eliminar la estadística" }
  }
}
