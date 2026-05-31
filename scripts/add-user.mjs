/**
 * Usage: node scripts/add-user.mjs <email> <password> [name]
 * Adds a credentials user to data/users.json
 */
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const scryptAsync = promisify(scrypt);
const root = join(fileURLToPath(import.meta.url), "../..");

const [, , email, password, name] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/add-user.mjs <email> <password> [name]");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = (await scryptAsync(password, salt, 64)).toString("hex");
const passwordHash = `${salt}:${hash}`;

const filePath = join(root, "data", "users.json");
const users = JSON.parse(readFileSync(filePath, "utf-8"));

const existing = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
const entry = { email, name: name ?? email, passwordHash };

if (existing >= 0) {
  users[existing] = entry;
  console.log(`Updated: ${email}`);
} else {
  users.push(entry);
  console.log(`Added: ${email}`);
}

writeFileSync(filePath, JSON.stringify(users, null, 2));
