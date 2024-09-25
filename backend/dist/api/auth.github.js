export class GithubOAuth {
    CLIENT_ID;
    CLIENT_SECRET;
    CALLBACK_URL;
    constructor() {
        this.CLIENT_ID = process.env.GITHUB_CLIENT_ID;
        this.CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
        this.CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
    }
    getGithubOAuthURL = () => {
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            redirect_uri: this.CALLBACK_URL,
            scope: "read:user",
        });
        const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
        return url;
    };
    getAccessToken = async (code) => {
        const res = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                code,
            }),
        });
        if (!res.ok) {
            throw new Error("Failed to fetch access token");
        }
        const data = await res.json();
        return data.access_token;
    };
    validate = async (c) => {
        const code = c.req.query("code");
        if (!code)
            return c.text("No code provided", 400);
        try {
            const accessToken = await this.getAccessToken(code);
            const userResponse = await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!userResponse.ok) {
                throw new Error("Failed to fetch user info");
            }
            const userData = await userResponse.json();
            const userInfo = {
                userId: userData.login,
                accessToken,
                avatarUrl: userData.avatar_url,
                name: userData.name,
                followers: userData.followers,
                following: userData.following,
                createdAt: new Date(),
            };
            return userInfo;
        }
        catch (error) {
            throw error;
        }
    };
}
