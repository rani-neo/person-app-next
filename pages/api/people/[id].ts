import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = Number(req.query.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid person ID',
    });
  }

  try {
    // GET ONE PERSON
    if (req.method === 'GET') {
      const result = await sql`
        SELECT *
        FROM people
        WHERE id = ${id}
      `;

      if (result.length === 0) {
        return res.status(404).json({
          error: 'Person not found',
        });
      }

      return res.status(200).json(result[0]);
    }

    // DELETE PERSON
    if (req.method === 'DELETE') {
      const result = await sql`
        DELETE FROM people
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({
          error: 'Person not found',
        });
      }

      return res.status(200).json({
        message: 'Person deleted successfully',
        person: result[0],
      });
    }

    // PUT / UPDATE PERSON
    if (req.method === 'PUT') {
      const { name, age, email } = req.body;

      const result = await sql`
        UPDATE people
        SET
          name = ${name},
          age = ${age},
          email = ${email}
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({
          error: 'Person not found',
        });
      }

      return res.status(200).json(result[0]);
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);

    return res.status(405).json({
      error: `Method ${req.method} not allowed`,
    });

  } catch (error) {
    console.error('API error:', error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}
