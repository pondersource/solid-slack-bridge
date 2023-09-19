require('dotenv').config();

import { Session } from "@inrupt/solid-client-authn-node";
import { App, LogLevel } from "@slack/bolt";
import { BASE_URL, PORT } from "./config/default";
import { expressReceiver } from "./expressReceiver";
import { sharedSessions } from "./sharedSessions";
import { IMessage } from "./types";
import { createUserMessage } from "./utils";


const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
  logLevel: LogLevel.DEBUG,
  receiver: expressReceiver,
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
  const session = sharedSessions["BOT_USER"] as Session
  const _message = message as IMessage;
  console.log("----------onMessage-----------");
  if (session) {
    try {
      // await createMessage({ messageBody: _message, session: sharedSessions });
      await createUserMessage({ session, messageBody: _message })
    } catch (error: any) {
      console.log(error.message);
    }
  } else {
    say(`You are not logein in, please visit ${BASE_URL}/login first`)
  }
});

(async () => {
  await app.start(PORT);
  console.log("⚡️ Bolt app started");
})();