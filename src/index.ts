require('dotenv').config();

import { App, LogLevel } from "@slack/bolt";
import { apiClient } from "./apiClient";
import { PORT } from "./config/default";
import { expressReceiver } from "./expressReceiver";
import { IMessage } from "./types";
import { createMessage } from "./utils";
import { sharedSessions } from "./sharedSessions";


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
  // console.log("---------------------");
  // console.log(sharedSessions);
  // console.log("---------------------");


  const _message = message as IMessage;
  console.log("---------------------");
  console.log(_message);
  console.log("---------------------");

  // const session = await getSessionFromStorage(context.req.session.sessionId);
  // sharedSessions
  try {
    // TODO
    // await createMessage({ messageBody: _message, session: sharedSessions });
    // await createChatHttp(_message);

    // await apiClient.get('/login')
    // const { data, status } = await apiClient.post('/write-to-pod', _message)

    // console.log(".....................");
    // console.log(data);
    // console.log(".....................");

  } catch (error: any) {
    console.log(error.message);
  }
});

(async () => {
  await app.start(PORT);
  console.log("⚡️ Bolt app started");
})();