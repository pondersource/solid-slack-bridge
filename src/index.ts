// require("dotenv").config();

import { App } from "@slack/bolt";
import { apiClient } from "./apiClient";
import { PORT, SERVER_BASE_URL, SERVER_PORT } from "./config/default";
import { IMessage } from "./types";
import { logger } from "./utils/logger";
import { expressApp } from "./express";
import { sessionStore } from "./sharedSessions";
import { createUserMessage } from "./utils";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.message(async ({ message, say, context }) => {
  logger.info("----------onMessage-----------");
  const slackUUID = (message as IMessage).user;
  const session = await sessionStore.getSession(slackUUID);
  // const url = `${SERVER_BASE_URL}/write-to-pod`
  // try {
  //   const res = await apiClient.post(url, message);
  //   logger.info(res.data, "res.data")
  // } catch (error: any) {
  //   logger.info(error.response.data, "error.response.data")
  //   if (error.response.status === 401) {
  //     say(`You are not Authenticated, please visit ${SERVER_BASE_URL}/login?slackUUID=${slackUUID} first`);
  //   }
  // }
  if (session) {
    logger.info("----------hasSession-----------");
    try {
      await createUserMessage({ session, messageBody: message as IMessage });
    } catch (error: any) {
      console.log(error.message);
    }
  } else {
    logger.info("----------noSession-----------");
    say(`You are not Authenticated, please visit ${SERVER_BASE_URL}/login?slackUUID=${slackUUID} first`);
  }
});




(async () => {
  await app.start(PORT);
  logger.info("⚡️ Bolt app started");
  await expressApp.listen(SERVER_PORT, () => logger.info(`Running on port http://localhost:${SERVER_PORT}`));
})();
