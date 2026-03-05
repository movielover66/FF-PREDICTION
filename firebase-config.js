// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBR8rhkA8kxB-KncM2kxNzVe2Cyy0Sv5U",
  authDomain: "ffffff-6d58d.firebaseapp.com",
  databaseURL: "https://ffffff-6d58d-default-rtdb.firebaseio.com",
  projectId: "ffffff-6d58d",
  storageBucket: "ffffff-6d58d.firebasestorage.app",
  messagingSenderId: "899249274124",
  appId: "1:899249274124:web:488add278359d438badd29",
  measurementId: "G-4M8QM1EX8T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ডাটা ফেচ করার ফাংশন (ইতিমধ্যে আছে)
export async function fetchArchiveData() {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, `Archives_With_Patti`));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error("🔥 Firebase Connection Error:", error);
        return null;
    }
}

// 🆕 নতুন: প্রতিদিনের ডাটা Firebase-এ সেভ করার ফাংশন
export async function saveDayData(date, results, pattis) {
    const dbRef = ref(db);
    try {
        await set(child(dbRef, `Archives_With_Patti/${date}`), {
            results: results,
            pattis: pattis
        });
        console.log(`✅ Day ${date} saved to Firebase successfully!`);
    } catch (error) {
        console.error("🔥 Firebase Save Error:", error);
    }
}

export { db, ref, get, child, set };