export const openDB = (dbName, version) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create an object store for quiz history if it doesn’t exist
            if (!db.objectStoreNames.contains("quizHistory")) {
                db.createObjectStore("quizHistory", { keyPath: "id", autoIncrement: true });
            }
        };
    });
};

export const saveQuizAttempt = async (attempt) => {
    const db = await openDB("QuizDatabase", 1);

    const transaction = db.transaction("quizHistory", "readwrite");
    const store = transaction.objectStore("quizHistory");

    store.add({
        timestamp: new Date().toISOString(),
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
    });

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
};

export const getQuizHistory = async () => {
    const db = await openDB("QuizDatabase", 1);

    const transaction = db.transaction("quizHistory", "readonly");
    const store = transaction.objectStore("quizHistory");

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};
