require('dotenv').config();

import { Session, getSessionFromStorage } from "@inrupt/solid-client-authn-node";
import { App, LogLevel } from "@slack/bolt";
import { BASE_URL, PORT } from "./config/default";
import { expressReceiver } from "./expressReceiver";
import { sessionStore } from "./sharedSessions";
import { IMessage } from "./types";
import { createUserMessage } from "./utils";


const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
  // receiver: expressReceiver,
  // customRoutes: [
  //   {
  //     path: '/post',
  //     method: ['POST'],
  //     handler: async (req, res) => {
  //       const body = await getBody(req)
  //       res.writeHead(200);
  //       res.end(JSON.stringify(JSON.parse(body as any)));
  //     },
  //   },
  // ],
});

app.message(async ({ message, say, context }) => {
  const _message = message as IMessage;
  const slackUUID = _message.user;
  const session = await sessionStore.getSession(slackUUID);
  // This deprecates the line below \/
  // const session = sharedSessions["BOT_USER"] as Session
  console.log("----------onMessage-----------");
  if (session) {
    try {
      // await createMessage({ messageBody: _message, session: sharedSessions });
      await createUserMessage({ session, messageBody: _message })
    } catch (error: any) {
      console.log(error.message);
    }
  } else {
    say(`You are not logein in, please visit ${BASE_URL}/login?slackUUID=${slackUUID} first`)
  }
});

(async () => {
  await app.start(PORT);
  console.log("⚡️ Bolt app started");
})();