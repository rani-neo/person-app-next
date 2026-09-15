import { NextApiRequest, NextApiResponse } from 'next';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Person } from '../../../types/types';
import { Database } from '../Database';
import { neon } from '@neondatabase/serverless';

// Calculate the path to db.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../db.json');

console.log("file:", file);

// Set up the database connection using LowDB
const adapter = new JSONFile<Database>(file);
const defaultData: Database = { people: [] };

const db = new Low(adapter, defaultData);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Make sure to read the current database state before making any operations
  await db.read();

  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string);

    // Debug: Log the number of records in the database
    console.log(`Number of records in the database: ${(db.data as Database).people.length}`);

    const person = (db.data as Database).people.find((p: Person) => p.id === id);

    if (!person) {
      res.status(404).json({ error: 'Person not found' });
    } else {
      res.json(person);
    }
  } else if (req.method === 'PUT') {
    // Handle the PUT (update) method
    const id = parseInt(req.query.id as string);
    const updatedPerson: Person = req.body;

    const index = (db.data as Database).people.findIndex((p: Person) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Person not found' });
    } else {
      (db.data as Database).people[index] = { ...updatedPerson, id };
      await db.write();
      res.json(updatedPerson);
    }
  } else if (req.method === 'DELETE') {
    // Handle the DELETE method
    const id = parseInt(req.query.id as string);
    const index = (db.data as Database).people.findIndex((p: Person) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Person not found' });
    } else {
      const deletedPerson = (db.data as Database).people.splice(index, 1)[0];
      await db.write();
      res.json(deletedPerson);
    }
  } else {
    // If the request method is not supported, respond with "method not allowed"
    res.status(405).end();
  }
};
