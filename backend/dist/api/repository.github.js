import fetch from "node-fetch";
import "dotenv/config";
const GITHUB_API_URL = "https://api.github.com";
export class GithubRepo {
    accessToken;
    constructor(accessToken) {
        if (!accessToken) {
            throw new Error("GitHub Access Token が設定されていません。");
        }
        this.accessToken = accessToken;
    }
    async create(repoName) {
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
        };
        const body = JSON.stringify({
            name: repoName,
        });
        const response = await fetch(`${GITHUB_API_URL}/user/repos`, {
            method: "POST",
            headers: headers,
            body: body,
        });
        const repoData = (await response.json());
        return repoData;
    }
    async getDirs(userId, repoName, filePath) {
        let url;
        if (!filePath) {
            url = `${GITHUB_API_URL}/repos/${userId}/${repoName}/contents`;
        }
        else {
            url = `${GITHUB_API_URL}/repos/${userId}/${repoName}/contents/${filePath}`;
        }
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });
            const data = (await response.json());
            const directories = data.map((item) => {
                return { name: item.name, type: item.type };
            });
            return directories;
        }
        catch (error) {
            console.error("Error fetching directories:", error);
            throw new Error();
        }
    }
    async commit(userId, repo, dirName, jsonData, message) {
        const date = new Date();
        const file = `${dirName}-` + date.toISOString().split("T")[0];
        const fileContent = JSON.stringify(jsonData, null, 2);
        const encodedContent = Buffer.from(fileContent).toString("base64");
        const url = `https://api.github.com/repos/${userId}/${repo}/contents/${dirName}/${file}.json`;
        const body = {
            message,
            content: encodedContent,
        };
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `token ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                console.log(`File ${file} added successfully to the repository.`);
            }
            else {
                const errorData = await response.json();
                console.error("Failed to add file:", errorData);
            }
        }
        catch (error) {
            console.error("Error adding file:", error);
        }
    }
}
