import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = Number(req.query.id);

  // Validate ID
  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid person ID',
    });
  }

  try {

    // =========================
    // GET ONE PERSON
    // =========================
    if (req.method === 'GET') {

      const result = await sql`
        SELECT id, firstname, lastname, phone
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


    // =========================
    // UPDATE PERSON
    // =========================
    if (req.method === 'PUT') {

      const { firstname, lastname, phone } = req.body;

      // Validate input
      if (!firstname || !lastname || !phone) {
        return res.status(400).json({
          error: 'Firstname, lastname and phone are required',
        });
      }

      const result = await sql`
        UPDATE people
        SET
          firstname = ${firstname},
          lastname = ${lastname},
          phone = ${phone}
        WHERE id = ${id}
        RETURNING id, firstname, lastname, phone
      `;

      if (result.length === 0) {
        return res.status(404).json({
          error: 'Person not found',
        });
      }

      return res.status(200).json({
        message: 'Person updated successfully',
        person: result[0],
      });
    }


    // =========================
    // DELETE PERSON
    // =========================
    if (req.method === 'DELETE') {

      const result = await sql`
        DELETE FROM people
        WHERE id = ${id}
        RETURNING id, firstname, lastname, phone
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


    // =========================
    // METHOD NOT ALLOWED
    // =========================
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
