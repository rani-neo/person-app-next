import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    // GET ALL PEOPLE
    if (req.method === 'GET') {
      const people = await sql`
        SELECT id, firstname, lastname, phone
        FROM people
        ORDER BY id ASC
      `;

      return res.status(200).json(people);
    }

    // ADD NEW PERSON
    if (req.method === 'POST') {
      const { firstname, lastname, phone } = req.body;

      if (!firstname || !lastname || !phone) {
        return res.status(400).json({
          error: 'Firstname, lastname and phone are required',
        });
      }

      const result = await sql`
        INSERT INTO people (firstname, lastname, phone)
        VALUES (${firstname}, ${lastname}, ${phone})
        RETURNING id, firstname, lastname, phone
      `;

      return res.status(201).json(result[0]);
    }

    res.setHeader('Allow', ['GET', 'POST']);

    return res.status(405).json({
      error: 'Method not allowed',
    });

  } catch (error) {
    console.error('Database error:', error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}
