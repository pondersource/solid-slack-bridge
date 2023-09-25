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



app.command("/solid-login", async ({ command, ack ,}) => {
  await ack(`${SERVER_BASE_URL}/login?slackUUID=${command.user_id}`)
});


app.message(async ({ message, say, context }) => {
  logger.info("----------onMessage-----------");
  const { members } = await app.client.conversations.members({ channel: message.channel });
  console.log("🚀 ~ file: index.ts:27 ~ app.message ~ members:", members)
  const slackUUID = (message as IMessage).user;
  console.log("🚀 ~ file: index.ts:46 ~ app.message ~ slackUUID:", slackUUID)
  const session = await sessionStore.getSession(slackUUID);
  if (session) {
    logger.info("----------hasSession-----------");
    try {
      members?.forEach(async (member) => {
        let memberSession = await sessionStore.getSession(member);

        if (memberSession) {
          await createUserMessage({ session: memberSession, maker: session.info.webId, messageBody: message as IMessage });
        }
      });
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
