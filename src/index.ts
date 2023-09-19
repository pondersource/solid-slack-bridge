require('dotenv').config();

import { App, LogLevel } from "@slack/bolt";
import { apiClient } from "./apiClient";
import { BASE_URL, PORT } from "./config/default";
import { expressReceiver } from "./expressReceiver";
import { IMessage } from "./types";
import { createMessage, createUserMessage } from "./utils";
import { sharedSessions } from "./sharedSessions";
import { Session, getSessionFromStorage } from "@inrupt/solid-client-authn-node";


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


// app.event('app_home_opened', async ({ event, client, logger, context }) => {
//   console.log("............................");
//   console.log("app_home_opened", context.req.webId);
//   console.log("............................");
//   // const session = await getSessionFromStorage(context.req.session?.sessionId);
//   // await session?.handleIncomingRedirect(`${BASE_URL}${context.req.url}`);

//   // await session?.handleIncomingRedirect(`https://app.slack.com/client/T03E34GGWE5/D05SELC7KGV`);
//   // console.log("🚀 ~ file: index.ts:38 ~ app.event ~ session:", session)

// });
app.message(async ({ message, say, context }) => {
  const session = sharedSessions["BOT_USER"] as Session
  const _message = message as IMessage;
  console.log("---------------------");
  console.log(_message);
  console.log("---------------------");

  try {
    await createMessage({ messageBody: _message });
  } catch (error: any) {
    console.log(error.message);
  }
  return
  if (session) {
    try {
      // await createUserMessage({ session, messageBody: _message })
      // await createMessage({ messageBody: _message, session: sharedSessions });
    } catch (error: any) {
      console.log(error.message);
    }
  } else {
    say("You are not logein in, please visit https://guiding-bull-tidy.ngrok-free.app/login first")
  }
});

(async () => {
  await app.start(PORT);
  console.log("⚡️ Bolt app started");
})();