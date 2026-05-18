/**
 * Cloudflare Workers Sync API
 * Push/Pull/Full sync endpoints for V4 offline sync
 */

/**
 * @param {Request} request
 * @param {object} env - Environment bindings (env.DB is D1Database)
 */
async function handlePull(request, env) {
  const url = new URL(request.url)
  const since = url.searchParams.get('since') || '1970-01-01T00:00:00Z'
  const familyId = url.searchParams.get('familyId')

  const db = env.DB

  const tables = [
    'family_members', 'babies', 'tasks', 'checkins',
    'achievements', 'points', 'reward_items', 'exchange_records'
  ]

  const changes = {}

  for (const table of tables) {
    try {
      const query = familyId
        ? `SELECT * FROM ${table} WHERE updatedAt > ? AND familyId = ? ORDER BY updatedAt ASC`
        : `SELECT * FROM ${table} WHERE updatedAt > ? ORDER BY updatedAt ASC`

      const stmt = db.prepare(query)
      const result = familyId
        ? await stmt.bind(since, familyId).all()
        : await stmt.bind(since).all()

      changes[table] = /** @type {any[]} */ (result.results || [])
    } catch (err) {
      console.error(`[Pull] Error querying ${table}:`, err)
      changes[table] = []
    }
  }

  return new Response(JSON.stringify({ success: true, changes, since }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * @param {Request} request - { changes: { table: rows[] } }
 * @param {object} env - Environment bindings
 */
async function handlePush(request, env) {
  const body = await request.json()
  const { changes = {} } = body

  const db = env.DB
  const results = {}
  const conflicts = []

  for (const [table, rows] of Object.entries(changes)) {
    results[table] = { inserted: 0, updated: 0, conflicts: 0 }

    const typedRows = /** @type {any[]} */ (rows)
    for (const row of typedRows) {
      try {
        const existing = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`)
          .bind(row.id).first()

        if (existing) {
          const existingTime = new Date(existing.updatedAt || 0).getTime()
          const newTime = new Date(row.updatedAt || 0).getTime()

          if (existingTime > newTime) {
            conflicts.push({ table, id: row.id, local: row, remote: existing })
            results[table].conflicts++
            continue
          }

          const columns = Object.keys(row)
          const sets = columns.map(c => `${c} = ?`).join(', ')
          const values = columns.map(c => row[c])

          await db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`)
            .bind(...values, row.id).run()
          results[table].updated++
        } else {
          const columns = Object.keys(row)
          const cols = columns.join(', ')
          const placeholders = columns.map(() => '?').join(', ')
          const values = columns.map(c => row[c])

          await db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`)
            .bind(...values).run()
          results[table].inserted++
        }
      } catch (err) {
        console.error(`[Push] Error processing row in ${table}:`, err)
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    results,
    conflicts: conflicts.length > 0 ? conflicts : undefined
  }), { headers: { 'Content-Type': 'application/json' } })
}

/**
 * Full sync: fetch all data for a family
 */
async function handleFull(request, env) {
  const url = new URL(request.url)
  const familyId = url.searchParams.get('familyId')

  if (!familyId) {
    return new Response(JSON.stringify({ error: 'familyId required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }

  const db = env.DB
  const tables = [
    'family_members', 'babies', 'tasks', 'checkins',
    'achievements', 'points', 'reward_items', 'exchange_records'
  ]

  const data = {}

  for (const table of tables) {
    try {
      const stmt = db.prepare(`SELECT * FROM ${table} WHERE familyId = ? ORDER BY updatedAt ASC`)
        .bind(familyId)
      const result = await stmt.all()
      data[table] = result.results || []
    } catch (err) {
      console.error(`[Full] Error querying ${table}:`, err)
      data[table] = []
    }
  }

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname === '/api/sync/pull') {
      return handlePull(request, env)
    }

    if (url.pathname === '/api/sync/push') {
      return handlePush(request, env)
    }

    if (url.pathname === '/api/sync/full') {
      return handleFull(request, env)
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    })
  }
}