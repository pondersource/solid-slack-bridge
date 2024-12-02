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
  const slackClient = new SlackClient(identityManager);
  await slackClient.create(sessionStore, EXPRESS_HOST || '');
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
  // solidClient.on('login', (home: string, id: string) => {
  //   identityManager.addIdentity(home, id, undefined);
  //   console.log(`solid login event`, home, id);
  // });
  // solidClient.on('logout', (e, f) => {
  //   console.log(`solid logout event`, e, f);
  // });
  const routes = solidClient.getExpressRoutes(EXPRESS_HOST || '', '/solid');
  console.log(Object.keys(routes));
  Object.keys(routes).forEach(route => {
    expressApp.get(route, routes[route]);
  });
  expressApp.get('/', async (req: Request, res: Response) => {
    const webId = await solidClient.getWebId(req);
    console.log(JSON.stringify(webId));
    if (webId) { // FIXME: let
      res.status(200).send(`Hi there! Are you ready to sync some Slack conversations to your main Solid pod for ${webId}? From here you have two options:<ul><li>Type <tt>/tubs-connect</tt> in a Slack workspace that has <a href="https://api.slack.com/apps/A080HGBNZAA">our Slack app</a> installed</li><li><a href="/solid/logout">Log out</a></li>`);
    } else {
      res.status(200).send(`Log in with your main WebID to <a href="/solid">get started</a>.`);
    }
  })
  expressApp.get('/slack/login', slackClient.handleLogin.bind(slackClient));
  expressApp.get('/slack/logout', slackClient.handleLogout.bind(slackClient));
  await new Promise(resolve => expressApp.listen(EXPRESS_PORT, () => resolve(undefined)));


  console.log(`Express app running on ${EXPRESS_PORT}. Please visit ${EXPRESS_HOST}/`);
})();
