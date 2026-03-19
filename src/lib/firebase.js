import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Esta configuración lee directamente lo que pusiste en tu .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Truco de experto: Evita que Firebase se reinicie cada vez que guardas un cambio en el código
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en tus componentes de React/Next.js
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;