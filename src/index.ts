import { App } from "@slack/bolt";
const { FileInstallationStore } = require('@slack/oauth');
import { PORT, SERVER_BASE_URL, SERVER_PORT } from "./config/default";
import { expressApp } from "./express";
import { sessionStore } from "./sharedSessions";
import { IMessage } from "./types";
import { createUserMessage, isUrlValid } from "./utils";
import { logger } from "./utils/logger";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";

function getBody(request: ParamsIncomingMessage) {
  return new Promise<string>((resolve) => {
    const bodyParts: any = [];
    let body;
    request.on('data', (chunk) => {
      bodyParts.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(bodyParts).toString();
      resolve(body)
    });
  });
}

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  installationStore: new FileInstallationStore(),
  stateSecret: 'my-state-secret',
  scopes: [
    'channels:history',
    'channels:join',
    'channels:read',
    'chat:write',
    'commands',
    'groups:read',
    'groups:history',
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
  customRoutes: [
    {
      path: '/slack/solidmessage',
      method: ['POST'],
      handler: async (req, res) => {
        const rawBody: string = await getBody(req);
        const body = JSON.parse(rawBody);

        res.writeHead(200);

        if (body.challenge) {
          console.log('Received challenge');
          res.end(body.challenge);
          return;
        }
        
        console.log('event type', body.type);
        console.log('event', body.event);
        res.end('OK');
      }
    },
    {
      path: '/slack/command',
      method: ['POST'],
      handler: async (req, res) => {
        const rawBody: string = await getBody(req);
        const params = new URLSearchParams(rawBody);
        const solidUUID = params.get('user_id');
        const command = params.get('command');
        const text: string|null = params.get('text');

        res.writeHead(200);

        if (command == '/solid-login') {
          let loginURL = `${SERVER_BASE_URL}/login?slackUUID=${solidUUID}`
          if (text && isUrlValid(text)) {
            loginURL = `${SERVER_BASE_URL}/login?slackUUID=${solidUUID}&loginURL=${text}`;
          }
          res.end(loginURL);
          return;
        }

        if (command == '/solid-logout') {
          let logoutURL = `${SERVER_BASE_URL}/logout?slackUUID=${solidUUID}`;
          res.end(logoutURL);
          return;
        }

        res.end('Bad command');
      },
    }
  ],
  port: PORT
});

app.event('message', async() => {
  logger.info("----------onMessagessssssss-----------");
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
