import { App } from "@slack/bolt";
import axios from "axios";

import { IMessage } from "./types";
import { PORT, SLACK_BOT_USER_TOKEN, SLACK_SIGNING_SECRET } from "./config/default";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_USER_TOKEN,
  customRoutes: [
    {
      path: "/",
      method: ["GET"],
      handler: (req, res) => {
        res.writeHead(200);
        res.end("OK");
      },
    },
    {
      path: "/health-check",
      method: ["GET"],
      handler: (req, res) => {
        res.writeHead(200);
        res.end(JSON.stringify({ "status": "healthy" }));
      },
    },
  ],
});

(async () => {
  console.log("Connecting to slack");

  await app.start(PORT);

  app.message(async ({ message, say }) => {
    const _message = message as IMessage;

    try {
      let data = `INSERT DATA { <https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#this> <http://www.w3.org/2005/01/wf/flow#message> <https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://rdfs.org/sioc/ns#content> "${_message.text}\\n" .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://purl.org/dc/terms/created> "2023-09-13T11:58:02Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .\n<https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl#Msg1694606282236> <http://xmlns.com/foaf/0.1/maker> <https://solid-crud-tests-example-1.solidcommunity.net/profile/card#me> .\n }\n`;
      let resp = await axios.patch(
        `https://michielbdejong.solidcommunity.net/shops/Chat/id1694605963871/index.ttl`,
        data,
        {
          headers: {
            "content-type": "application/sparql-update",
          },
        }
      );
      console.log("...............");
      console.log(resp.data);
      console.log("...............");
    } catch (error: any) {
      console.log(error.message);
    }
  });

  console.log(`⚡️ Bolt app is running!`);
})();
