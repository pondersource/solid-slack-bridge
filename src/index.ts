import { App } from "@slack/bolt";
import { PORT, SERVER_BASE_URL, SERVER_PORT } from "./config/default";
import { expressApp } from "./express";
import { sessionStore } from "./sharedSessions";
import { IMessage } from "./types";
import { createUserMessage, isUrlValid } from "./utils";
import { logger } from "./utils/logger";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  port: PORT
});



app.command("/solid-login", async ({ command, ack, body, payload }) => {
  let loginURL = `${SERVER_BASE_URL}/login?slackUUID=${command.user_id}`
  if (isUrlValid(payload.text)) {
    loginURL = `${SERVER_BASE_URL}/login?slackUUID=${command.user_id}&loginURL=${payload.text}`
  }
  await ack(loginURL)
});


app.command("/solid-logout", async ({ command, ack, body, payload }) => {
  let logoutURL = `${SERVER_BASE_URL}/logout?slackUUID=${command.user_id}`
  await ack(logoutURL)
});


app.message(async ({ message, say, context }) => {
  logger.info("----------onMessage-----------");

  // Get workspace id
  const { team } = await app.client.team.info()

  // Get members of this Slack conversation
  const { members } = await app.client.conversations.members({ channel: message.channel });

  // Slack user ID of the message sender
  const slackUUID = (message as IMessage).user;

  // Get the Solid session for this user if we have one
  const session = await sessionStore.getSession(slackUUID);

  // User's Slack profile info is used to look for their Solid webId
  const userInfo = await app.client.users.info({ user: slackUUID })
  const statusTextAsWebId = userInfo.user?.profile?.status_text ?? ""

  // Default maker points to user's profile on Slack
  let maker: string | undefined = `${team?.url}team/${slackUUID}`

  if (session) {
    // If we have the session, we know exactly who the maker is
    maker = session.info.webId
  } else if (isUrlValid(statusTextAsWebId)) {
    // Otherwise if it is indeed a web URL we trust that the user is not lying about their identity
    maker = statusTextAsWebId
  }

  try {
    // Create a copy of the message in the pods of all the members of the conversation who have a
    // Solid session with us.
    members?.forEach(async (member) => {
      let memberSession = await sessionStore.getSession(member);

      // Member has active session, so we write to the pod
      if (memberSession) {
        await createUserMessage({ session: memberSession, maker, messageBody: message as IMessage });
      }
    });
  } catch (error: any) {
    logger.error(error.message);
  }
});

(async () => {
  await app.start(PORT);
  logger.info("⚡️ Bolt app started");
  await expressApp.listen(SERVER_PORT, () => logger.info(`Running on port http://localhost:${SERVER_PORT}`));
})();
