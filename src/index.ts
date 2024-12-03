import { randomBytes } from "node:crypto";
import { BOLT_PORT, EXPRESS_HOST, EXPRESS_PORT } from "./config/default";
import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import { Solid } from "@tubsproject/solid";
import { SlackClient } from "./SlackClient";
import { logger } from "./utils/logger";
import { SessionStore } from "./sessionStore";
import { IdentityManager } from "./IdentityManager";

(async () => {
  const sessionStore: SessionStore = new SessionStore();
  await sessionStore.connect();
  logger.info('connected to tubs database');
  const identityManager = new IdentityManager(sessionStore.getClient());
  const slackClient = new SlackClient(identityManager, sessionStore);
  await slackClient.create(EXPRESS_HOST || '');
  await slackClient.start(BOLT_PORT);
  logger.info(`⚡️ Bolt app running on port http://localhost:${BOLT_PORT}`);
  
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(
    cookieSession({
      name: "session",
      // These keys are required by cookie-session to sign the cookies.
      keys: [
        process.env.COOKIE_SIGNING_SECRET || randomBytes(32).toString('hex')
      ],
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })
  ); 
  
  const solidClient = new Solid(sessionStore.getClient());
  const routes = solidClient.getExpressRoutes(EXPRESS_HOST || '', '/solid');
  console.log(Object.keys(routes));
  Object.keys(routes).forEach(route => {
    expressApp.get(route, routes[route]);
  });
  expressApp.get('/', async (req: Request, res: Response) => {
    const webId = await solidClient.getWebId(req);
    console.log(JSON.stringify(webId));
    if (webId) {
      const slackIds = await identityManager.getSlackIds(webId);
      console.log(`webId ${webId}, slackIds ${slackIds.join(', ')}, getting session`);
      const solidSession = await solidClient.getSession(req);
      if (solidSession) {
        console.log('storing', webId, solidSession.info.sessionId);
        sessionStore.saveSession(webId, solidSession.info.sessionId);
      }
      if (slackIds.length) {
        res.status(200).send(`Hi there! Your web ID is ${webId}. Your Slack IDs are:<ul>${slackIds.map(id => `<li>${id} (type <tt>/tubs-disconnect</tt> in Slack to disconnect it)</li>`)}`);
      } else {
        res.status(200).send(`Hi there! Are you ready to sync some Slack conversations to your main Solid pod for ${webId}? From here you have two options:<ul><li>Type <tt>/tubs-connect</tt> in a Slack workspace that has <a href="https://api.slack.com/apps/A080HGBNZAA">our Slack app</a> installed</li><li><a href="/solid/logout">Log out</a></li>`);
      }
    } else {
      res.status(200).send(`Log in with your main WebID to <a href="/solid">get started</a>.`);
    }
  })
  expressApp.get('/slack/login', async (req: Request, res: Response) => {
    const webId = await solidClient.getWebId(req);
    if (webId) {
      return slackClient.handleLogin(webId, req, res);
    }
    return res.status(200).send(`Please <a href="/solid/login">connect your Solid pod first</a>, and after that retry to connect your Slack account to it.`);
  });
  expressApp.get('/slack/logout', async (req: Request, res: Response) => {
    const webId = await solidClient.getWebId(req);
    if (webId) {
      return slackClient.handleLogout(webId, req, res);
    }
    return res.status(200).send(`Please <a href="/solid/login">connect your Solid pod first</a>, and after that retry to disconnect your Slack account from it.`);
  });
  await new Promise(resolve => expressApp.listen(EXPRESS_PORT, () => resolve(undefined)));


  console.log(`Express app running on ${EXPRESS_PORT}. Please visit ${EXPRESS_HOST}/`);
})();
