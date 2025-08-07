import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { neon } from "@neondatabase/serverless";

config();

// Replace this with your actual database URL
const YOUR_DATABASE_URL = "postgresql://neondb_owner:npg_w3QAabKMG9Dq@ep-hidden-flower-abyptd5z-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(YOUR_DATABASE_URL);

// ... (rest of the script)