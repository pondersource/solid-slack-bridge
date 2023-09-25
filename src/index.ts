// require("dotenv").config();

import { slackApp } from "./slackApp";
import { apiClient } from "./apiClient";
import { PORT, SERVER_BASE_URL, SERVER_PORT } from "./config/default";
import { IMessage } from "./types";
import { logger } from "./utils/logger";
import { expressApp } from "./express";
import { sessionStore } from "./sharedSessions";
import { createUserMessage } from "./utils";

slackApp.command("/solid-login", async ({ command, ack ,}) => {
  await ack(`${SERVER_BASE_URL}/login?slackUUID=${command.user_id}`)
});


slackApp.message(async ({ message, say, context }) => {
  logger.info("----------onMessage-----------");
  console.log('NEW MESSAGE', message);
  const { members } = await slackApp.client.conversations.members({ channel: message.channel });
  const slackUUID = (message as IMessage).user;
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
  await slackApp.start(PORT);
  logger.info("⚡️ Bolt app started");
  await expressApp.listen(SERVER_PORT, () => logger.info(`Running on port http://localhost:${SERVER_PORT}`));
})();
