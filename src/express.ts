import express, { NextFunction, Request, Response } from "express";
import { SERVER_BASE_URL, SERVER_PORT, SLACK_DOMAIN } from "./config/default";
import { sessionStore } from "./sharedSessions";
import { IMessage } from "./types";
import { createUserMessage } from "./utils";
import { logger } from "./utils/logger";
const cookieSession = require("cookie-session");
const {
  getSessionFromStorage,
  getSessionIdFromStorageAll,
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

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const sessionIds = await getSessionIdFromStorageAll();

  for (const sessionId in sessionIds) {
    // Do something with the session ID...
  }
  res.send(`<p>There are currently [${sessionIds.length}] visitors.</p>`);
});

app.get("/login", async (req: Request, res: Response) => {
  const session = new Session();
  const slackUUID = req.query.slackUUID as string;

  if (req.session) req.session.sessionId = session.info.sessionId;

  await session.login({
    oidcIssuer: "https://solidcommunity.net",
    // oidcIssuer: "https://login.inrupt.com",
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
  const session = await getSessionFromStorage(req.session?.sessionId);
  session?.logout();
  res.send(`<p>Logged out.</p>`);
});

app.post("/write-to-pod", async (req, res) => {
  const _message = req.body as IMessage;
  logger.info("🚀 ~ file: express.ts:84 ~ app.post ~ _message:", _message)
  const slackUUID = _message.user;
  const session = await sessionStore.getSession(slackUUID);
  if (session) {
    try {
      await createUserMessage({ session, messageBody: _message });
      res.status(201).send({
        message: `Message Inserted Into pod with WebId: ${session.info.webId}`
      });
    } catch (error: any) {
      res.status(502).send({
        message: `Error in write-to-pod`
      });
    }
  } else {
    res.status(401).send({
      message: `You are not Authenticated`
    });
  }
});
export const expressApp = app;
