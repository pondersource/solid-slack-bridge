// require("dotenv").config();

import { App } from "@slack/bolt";
import { apiClient } from "./apiClient";
import { PORT } from "./config/default";
import { IMessage } from "./types";
import { logger } from "./utils/logger";
import { expressApp } from "./express";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

app.message(async ({ message, say, context }) => {
  logger.info("----------onMessage-----------");
  const slackUUID = (message as IMessage).user;
  const url = `http://localhost:8080/write-to-pod`
  try {
    const res = await apiClient.post(url, message);
    logger.info(res.data, "res.data")
  } catch (error: any) {
    logger.info(error.response.data, "error.response.data")
    if (error.response.status === 401) {
      say(`You are not Authenticated, please visit http://localhost:8080/login?slackUUID=${slackUUID} first`);
    }
  }
});

// expressApp.use(app);


(async () => {
  await app.start(PORT);
  logger.info("⚡️ Bolt app started");
})();
