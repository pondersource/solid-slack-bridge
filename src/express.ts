import express, { NextFunction, Request, Response } from "express";
import { SERVER_BASE_URL, SLACK_DOMAIN } from "./config/default";
import { sessionStore } from "./sharedSessions";
const cookieSession = require("cookie-session");
const {
  getSessionFromStorage,
  Session,
} = require("@inrupt/solid-client-authn-node");

const app = express();

app.use(express.json());

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

app.get("/login", async (req: Request, res: Response) => {
  const session = new Session();
  const slackUUID = req.query.slackUUID as string;
  const loginURL = req.query.loginURL as string;

  if (req.session) req.session.sessionId = session.info.sessionId;

  await session.login({
    oidcIssuer: loginURL ?? "https://login.inrupt.com", // "https://solidcommunity.net" "https://login.inrupt.com"
    redirectUrl: `${SERVER_BASE_URL}/login/callback?slackUUID=${slackUUID}`,
    clientName: "Solid Slack Bridge",
    handleRedirect: (url: any) => res.redirect(url),
  });
});

app.get("/login/callback", async (req: Request, res: Response) => {
  const session = await getSessionFromStorage(req.session?.sessionId);

  await session?.handleIncomingRedirect(`${SERVER_BASE_URL}${req.url}`);

  if (session?.info.webId && session?.info.isLoggedIn) {
    const slackUUID = req.query.slackUUID as string;
    sessionStore.saveSession(slackUUID, session);
    return res.redirect(SLACK_DOMAIN);
  }
});

app.get("/logout", async (req: Request, res: Response, next: NextFunction) => {
  const slackUUID = req.query.slackUUID as string;
  const session = await getSessionFromStorage(req.session?.sessionId);
  session?.logout();
  sessionStore.removeSession(slackUUID);
  return res.redirect(SLACK_DOMAIN);

});

export const expressApp = app;
