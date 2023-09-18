import express, { NextFunction, Request, Response } from "express"
import { BASE_URL } from "./config/default";
const cookieSession = require("cookie-session");
const {
  getSessionFromStorage,
  getSessionIdFromStorageAll,
  Session
} = require("@inrupt/solid-client-authn-node");


const app = express()


app.use(express.json())
app.use(
  cookieSession({
    name: "session",
    // These keys are required by cookie-session to sign the cookies.
    keys: [
      "Required, but value not relevant for this demo - key1",
      "Required, but value not relevant for this demo - key2",
    ],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const sessionIds = await getSessionIdFromStorageAll();
  for (const sessionId in sessionIds) {
    // Do something with the session ID...
  }
  res.send(
    `<p>There are currently [${sessionIds.length}] visitors.</p>`
  );
});

app.get("/login", async (req: Request, res: Response) => {
  const session = new Session();
  if (req.session) req.session.sessionId = session.info.sessionId;

  await session.login({
    redirectUrl: `${BASE_URL}/login/callback`,
    oidcIssuer: "https://login.inrupt.com",
    clientName: "Demo app",
    handleRedirect: (url: any) => res.redirect(url),
  });
});

app.get("/login/callback", async (req: Request, res: Response) => {
  const session = await getSessionFromStorage(req.session?.sessionId);

  await session.handleIncomingRedirect(`${BASE_URL}${req.url}`);

  if (session.info.isLoggedIn) {
    (req as any).webId = "webId"
    return res.send(`<p>Logged in with the WebID ${session.info.webId}.</p>`)
  }
});
app.post("/post", async (req: Request, res: Response) => {

  const msgBody = req.body
  console.log("msgBody", msgBody);
  res.send(msgBody)
  // const session = await getSessionFromStorage(req.session?.sessionId);

  // if (session.info.isLoggedIn) {
  //   return res.send({ webId: session.info.webId })
  // }

});

app.get("/logout", async (req: Request, res: Response, next: NextFunction) => {
  const session = await getSessionFromStorage(req.session?.sessionId);
  session.logout();
  res.send(`<p>Logged out.</p>`);
});

export const expressApp = app