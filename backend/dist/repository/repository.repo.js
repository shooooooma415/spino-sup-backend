import { FirestoreConfig } from "../middleware/firebase.config";
import { getDocs, doc, collection, writeBatch, query, getDoc, where, } from "firebase/firestore";
export class RepositoryRepo {
    firestore;
    db;
    clc;
    constructor() {
        this.firestore = new FirestoreConfig();
        this.db = this.firestore.db;
        this.clc = collection(this.db, "Repository");
    }
    create = async (repo) => {
        const docRef = doc(this.clc, `${repo.userId}_${repo.name}`);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log("同じユーザーとリポジトリ名のデータが既に存在します。");
                return;
            }
            const batch = writeBatch(this.db);
            batch.set(docRef, repo);
            await batch.commit();
            console.log(`リポジトリ ${repo.name} が正常に作成されました。`);
        }
        catch (error) {
            console.error("エラーが発生しました: ", error);
        }
    };
    getbyUserId = async (userId) => {
        const q = where("userId", "==", userId);
        const repositories = await getDocs(query(this.clc, q));
        if (repositories.empty) {
            return [];
        }
        return repositories.docs.map((doc) => doc.data());
    };
}
