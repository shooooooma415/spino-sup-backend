import { FirestoreConfig } from "../middleware/firebase.config";
import { getDocs, doc, collection, writeBatch, runTransaction, getDoc, } from "firebase/firestore";
export class UniqueUserError extends Error {
}
export class UserRepo {
    firestore;
    db;
    clc;
    constructor() {
        this.firestore = new FirestoreConfig();
        this.db = this.firestore.db;
        this.clc = collection(this.db, "User");
    }
    bulkGet = async () => {
        try {
            const snapshot = await getDocs(this.clc);
            const data = snapshot.docs.map((doc) => doc.data());
            return data;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    };
    create = async (user) => {
        const docRef = doc(this.clc, user.userId);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                throw new UniqueUserError();
            }
            const batch = writeBatch(this.db);
            batch.set(docRef, user);
            await batch.commit();
            console.log(`ユーザー ${user.userId} が正常に作成されました。`);
        }
        catch (error) {
            if (error instanceof UniqueUserError) {
                this.update(user);
            }
            else {
                throw error;
            }
        }
    };
    update = async (user) => {
        const docRef = doc(this.clc, user.userId);
        const updatedAt = new Date();
        // createAtを排除して更新日のみでuserをinsert
        const { createdAt, ...updatedUser } = user;
        updatedUser.updatedAt = updatedAt;
        try {
            await runTransaction(this.db, async (transaction) => {
                const docSnap = await transaction.get(docRef);
                if (!docSnap.exists()) {
                    throw new Error(`ユーザー ${user.userId} は存在しません。`);
                }
                transaction.update(docRef, updatedUser);
            });
            console.log(`ユーザー ${user.userId} が正常に更新されました。`);
        }
        catch (error) {
            console.error("更新エラー:", error);
        }
    };
    get = async (userId) => {
        const docRef = doc(this.clc, userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`ユーザー ${userId} は存在しません。`);
        }
        return docSnap.data();
    };
}
