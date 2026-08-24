import { config } from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth();

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password });
  console.log(`Utilisateur existant mis à jour : ${user.uid}`);
} catch {
  user = await auth.createUser({ email, password, emailVerified: true });
  console.log(`Utilisateur créé : ${user.uid}`);
}

await auth.setCustomUserClaims(user.uid, { admin: true });
console.log(`Claim admin attribué à ${email} (uid: ${user.uid})`);
