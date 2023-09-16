require('dotenv').config();
import { App, LogLevel } from "@slack/bolt";
import { PORT } from "./config/default";
import { expressReceiver } from "./expressReceiver";
import { IMessage } from "./types";
import { createChat, createChatHttp } from "./utils";
import { getSessionFromStorage } from "@inrupt/solid-client-authn-node";
import axios from "axios";
import { ParamsIncomingMessage } from "@slack/bolt/dist/receivers/ParamsIncomingMessage";


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
  const _message = message as IMessage;
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
    .then(json => console.log(json))

  // console.log("context", context);
  // console.log(`context.req.webId`, context.req.webId);
  // console.log(`req.session.sessionId`, context.req.session.sessionId);
  // const session = await getSessionFromStorage(context.req.session.sessionId);
  // console.log(`session`, session);
  // console.log(`Logged in with the WebID ${session?.info.webId}`);


  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://8000-pondersourc-solidslackb-g76h1bqdgog.ws-eu104.gitpod.io/write-to-pod',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      "text": _message.text
    })
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });

  try {
    // await axios.post(`${baseURL}/write-to-pod`, {
    //   text: _message.text
    // })


    // await createChat(_message.text);
    // await createChatHttp(_message);
  } catch (error: any) {
    console.log(error.message);
  }
});

(async () => {
  await app.start(PORT);
  console.log("⚡️ Bolt app started");
})();