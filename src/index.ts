import { App } from "@slack/bolt";
const { FileInstallationStore } = require('@slack/oauth');
import { PORT, SERVER_BASE_URL, SERVER_PORT } from "./config/default";
import { expressApp } from "./express";
import { sessionStore } from "./sharedSessions";
import { IMessage } from "./types";
import { createUserMessage, isUrlValid } from "./utils";
import { logger } from "./utils/logger";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  installationStore: new FileInstallationStore(),
  redirectUri: SERVER_BASE_URL + 'oauth',
  stateSecret: 'my-state-secret',
  scopes: [
    'channels:history',
    'channels:join',
    'channels:read',
    'chat:write',
    'commands',
    'groups:read',
    'im:history',
    'im:read',
    'im:write',
    'mpim:history',
    'mpim:read',
    'mpim:write',
    'mpim:write.invites',
    'users.profile:read',
    'users:read',
    'team:read',
  ],
  installerOptions: {
    redirectUriPath: '/oauth',
  },
  //socketMode: true,
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
  let loginURL = `${SERVER_BASE_URL}/logout?slackUUID=${command.user_id}`
  await ack(loginURL)
});


app.message(async ({ message, say, context }) => {
  logger.info("----------onMessage-----------");
  const { team } = await app.client.team.info()

  const { members } = await app.client.conversations.members({ channel: message.channel });

  const slackUUID = (message as IMessage).user;

  const session = await sessionStore.getSession(slackUUID);

  const userInfo = await app.client.users.info({ user: slackUUID })

  const statusTextAsWebId = userInfo.user?.profile?.status_text ?? ""

  let maker: string | undefined = `${team?.url}team/${slackUUID}`

  if (session) {
    maker = session.info.webId
  } else if (isUrlValid(statusTextAsWebId)) {
    maker = statusTextAsWebId
  }

  try {
    members?.forEach(async (member) => {
      let memberSession = await sessionStore.getSession(member);

      // member has active session, so we write to the pod
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
