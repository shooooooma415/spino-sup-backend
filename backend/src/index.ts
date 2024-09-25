import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { CorsConfig } from "./middleware/cors";
import { UserService } from "./service/user.service";
import { GithubOAuth } from "./github/github.auth";
import { Repo } from './github/repository/createRepository';

const app = new Hono();
const service = new UserService();
const auth = new GithubOAuth();
const ACCESS_TOKEN = process.env.PRIVATE_ACCESS_TOKEN || '';
const repo = new Repo(ACCESS_TOKEN);


app.get("/users", async (c) => {
  const users = await service.bulkGet();
  return c.json(users);
});

app.use("/*", CorsConfig.policy);

app.get("/", (c) => {
  return c.json({ message: "Hello, Hono!" });
});

app.get("/auth/github", (c) => {
  return c.redirect(auth.getGithubOAuthURL());
});

app.get("/auth/github/callback", async (c) => {
  try {
    const user = await auth.validate(c);
    await service.create(user);
    return c.redirect(`http://localhost:3000/home/${user.userId}`);
  } catch (e) {
    throw e;
  }
});


app.get('/create/repo/:repoName', async (c) => {
  try {
    const repoName = c.req.param('repoName');
    const repoData = await repo.createRepo(repoName);
    return c.json({
      message: `リポジトリ "${repoData.name}" が作成されました。`,
      url: repoData.html_url,
    });
  } catch (e) {
    throw e;
  }
});

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
