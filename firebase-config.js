import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// GANTI BAGIAN DI BAWAH INI DENGAN MILIK ANDA DARI FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "TEMPEL_API_KEY_ANDA_DI_SINI",
    authDomain: "TEMPEL_AUTH_DOMAIN_ANDA_DI_SINI",
    projectId: "TEMPEL_PROJECT_ID_ANDA_DI_SINI",
    storageBucket: "TEMPEL_STORAGE_BUCKET_ANDA_DI_SINI",
    messagingSenderId: "TEMPEL_SENDER_ID_ANDA_DI_SINI",
    appId: "TEMPEL_APP_ID_ANDA_DI_SINI"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);