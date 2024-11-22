import { BOLT_PORT, EXPRESS_FULL_URL, EXPRESS_PORT } from "./config/default";
import { sessionStore } from "./sharedSessions";
import { createBoltApp } from "./bolt";
import { logger } from "./utils/logger";
import { SolidClient } from "@tubsproject/solid-client";

(async () => {
  await sessionStore.connect();
  logger.info('connected to tubs database');
  const boltApp = await createBoltApp(EXPRESS_FULL_URL || '');
  await boltApp.start(BOLT_PORT);
  logger.info(`⚡️ Bolt app running on port http://localhost:${BOLT_PORT}`);

  const app = new SolidClient(sessionStore.getClient());
  await app.listen(EXPRESS_PORT, EXPRESS_FULL_URL || '');
  console.log(`Express app running on ${EXPRESS_PORT}. Please visit ${EXPRESS_FULL_URL}/`);
})();
