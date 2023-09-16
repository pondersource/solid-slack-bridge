require('dotenv').config();
import { App, LogLevel } from "@slack/bolt";
import { PORT } from "./config/default";
import { expressReceiver } from "./expressReceiver";
import { IMessage } from "./types";
import { createChat } from "./utils";
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
  // fetch('https://jsonplaceholder.typicode.com/todos/1')
  //   .then(response => response.json())
  //   .then(json => console.log(json))
  // if (_message.text) {
  //   var myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");

  //   const raw = JSON.stringify({
  //     "text": "sldkjnlkj"
  //   });

  //   fetch("https://8000-pondersourc-solidslackb-g76h1bqdgog.ws-eu104.gitpod.io/write-to-pod", {
  //     method: 'POST',
  //     headers: myHeaders,
  //     body: raw,
  //     redirect: 'follow'
  //   })
  //     .then(response => response.text())
  //     .then(result => console.log(result))
  //     .catch(error => console.log('error', error));
  // }



  // console.log("context", context);
  // console.log(`context.req.webId`, context.req.webId);
  // console.log(`req.session.sessionId`, context.req.session.sessionId);
  // const session = await getSessionFromStorage(context.req.session.sessionId);
  // console.log(`session`, session);
  // console.log(`Logged in with the WebID ${session?.info.webId}`);

  let data = JSON.stringify({
    "text": "kjnkljn"
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://8000-pondersourc-solidslackb-g76h1bqdgog.ws-eu104.gitpod.io/write-to-pod',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
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
    // let data = `INSERT DATA { <https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#this> <http://www.w3.org/2005/01/wf/flow#message> <https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://rdfs.org/sioc/ns#content> "${_message.text}\\n" .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://purl.org/dc/terms/created> "2023-09-13T11:58:02Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://xmlns.com/foaf/0.1/maker> <https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me> .\n }\n`;
    // let resp = await axios.patch(
    //   `https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl`,
    //   data,
    //   {
    //     headers: {
    //       "content-type": "application/sparql-update",
    //     },
    //   }
    // );
    // console.log("...............");
    // console.log(resp.data);
    // console.log("...............");
  } catch (error: any) {
    console.log(error.message);
  }
});

(async () => {
  await app.start(PORT);
  console.log("⚡️ Bolt app started");
})();


function getBody(request: ParamsIncomingMessage) {
  return new Promise((resolve) => {
    const bodyParts: any[] = [];
    let body = "";
    request.on('readable', function () {
      body += request.read();
    });
    request.on('data', (chunk) => {
      bodyParts.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(bodyParts).toString();
      resolve(body)
    });
  });
}
