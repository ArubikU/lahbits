import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

const sql = neon(process.env.DATABASE_URL)

type Filter = {
  field: string
  operator: string
  value: any
}

type Join = {
  type: "INNER" | "LEFT" | "RIGHT" | "FULL"
  table: string
  on: string
}

type QueryBuilderProps = {
  table: string
  fields: string[]
  filters: Filter[]
  joins: Join[]
  sortBy: string | null
  sortOrder: "ASC" | "DESC" | null
  limit: number | null
  offset: number | null
}

class QueryBuilder {
  private props: QueryBuilderProps

  constructor(table: string) {
    this.props = {
      table,
      fields: ["*"], // Selección por defecto de todos los campos
      filters: [],
      joins: [],
      sortBy: null,
      sortOrder: null,
      limit: null,
      offset: null,
    }
  }

  select(fields: string[]) {
    this.props.fields = fields
    return this
  }

  where(field: string, operator: string, value: any) {
    this.props.filters.push({ field, operator, value })
    return this
  }

  sortBy(field: string, order: "ASC" | "DESC") {
    this.props.sortBy = field
    this.props.sortOrder = order
    return this
  }

  limitResults(limit: number) {
    this.props.limit = limit
    return this
  }

  offsetResults(offset: number) {
    this.props.offset = offset
    return this
  }

  // Soporte para JOINs
  join(type: "INNER" | "LEFT" | "RIGHT" | "FULL", table: string, on: string) {
    this.props.joins.push({ type, table, on })
    return this
  }

  // Construye el query completo y lo ejecuta
  async execute() {
    try {
      let query = `SELECT ${this.props.fields.join(", ")} FROM ${this.props.table}`

      // Añadir JOINs si existen
      if (this.props.joins.length > 0) {
        const joinClauses = this.props.joins.map(join => {
          return `${join.type} JOIN ${join.table} ON ${join.on}`
        }).join(" ")
        query += ` ${joinClauses}`
      }

      // Filtros WHERE
      if (this.props.filters.length > 0) {
        const whereClauses = this.props.filters.map((filter, i) => `${filter.field} ${filter.operator} $${i + 1}`).join(" AND ")
        query += ` WHERE ${whereClauses}`
      }

      // Ordenar
      if (this.props.sortBy) {
        query += ` ORDER BY ${this.props.sortBy} ${this.props.sortOrder}`
      }

      // Límite
      if (this.props.limit !== null) {
        query += ` LIMIT ${this.props.limit}`
      }

      // Desplazamiento
      if (this.props.offset !== null) {
        query += ` OFFSET ${this.props.offset}`
      }

      const values = this.props.filters.map(filter => filter.value)

      const result = await sql.query(query, values)
      return { success: true, result }
    } catch (error) {
      console.error("Error executing query:", error)
      return { success: false, message: "Error executing query" }
    }
  }
}

// Helper para operaciones de base de datos: INSERT, UPDATE, DELETE

export class DBHelper {
  // Inserta registros
  static async insertInto(table: string, data: Record<string, any> | any) {
    try {
      const fields = Object.keys(data).join(", ")
      const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(", ")
      const values = Object.values(data)

      const query = `
        INSERT INTO ${table} (${fields})
        VALUES (${placeholders})
        RETURNING *;
      `
      const result = await sql.query(query, values)
      return { success: true, result: result[0] }
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error)
      return { success: false, message: `Error inserting into ${table}` }
    }
  }

  // Actualiza registros
  static async update(table: string, data: Record<string, any>, condition: string, conditionValues: any[]) {
    try {
      const fields = Object.keys(data)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ")
      const values = Object.values(data)

      const query = `
        UPDATE ${table}
        SET ${fields}
        WHERE ${condition}
        RETURNING *;
      `

      const result = await sql.query(query, [...values, ...conditionValues])
      return { success: true, result: result[0] }
    } catch (error) {
      console.error(`Error updating table ${table}:`, error)
      return { success: false, message: `Error updating ${table}` }
    }
  }

  // Elimina registros
  static async deleteFrom(table: string, condition: string, conditionValues: any[]) {
    try {
      const query = `
        DELETE FROM ${table}
        WHERE ${condition}
        RETURNING *;
      `

      const result = await sql.query(query, conditionValues)
      return { success: true, result: result[0] }
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error)
      return { success: false, message: `Error deleting from ${table}` }
    }
  }

  // Contar registros
  static async count(table: string, condition: string = "", conditionValues: any[] = []) {
    try {
      const query = `SELECT COUNT(*) FROM ${table} ${condition ? `WHERE ${condition}` : ""}`
      const result = await sql.query(query, conditionValues)
      return { success: true, result: result[0].count }
    } catch (error) {
      console.error(`Error counting records in ${table}:`, error)
      return { success: false, message: `Error counting records in ${table}` }
    }
  }
}

// Helper para construcción de consultas
export const db = {
  build: (table: string) => new QueryBuilder(table)
}
