import { BOLT_PORT, EXPRESS_FULL_URL, EXPRESS_PORT } from "./config/default";
import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import { SolidClient } from "@tubsproject/solid-client";
import { createBoltApp } from "./bolt";
import { logger } from "./utils/logger";
import { SessionStore } from "./sessionStore";

(async () => {
  const sessionStore: SessionStore = new SessionStore();
  await sessionStore.connect();
  logger.info('connected to tubs database');
  const boltApp = await createBoltApp(sessionStore, EXPRESS_FULL_URL || '');
  await boltApp.start(BOLT_PORT);
  logger.info(`⚡️ Bolt app running on port http://localhost:${BOLT_PORT}`);

  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(
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
  
  const solidClient = new SolidClient(sessionStore.getClient());
  solidClient.addRoutesInExpress(expressApp, EXPRESS_FULL_URL || '');
  expressApp.get('/', (req: Request, res: Response) => {
    res.status(200).send('hi there');
  })
  await new Promise(resolve => expressApp.listen(EXPRESS_PORT, () => resolve(undefined)));


  console.log(`Express app running on ${EXPRESS_PORT}. Please visit ${EXPRESS_FULL_URL}/`);
})();
