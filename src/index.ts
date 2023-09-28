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
  customRoutes: [
    {
      path: '/hc',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end("OK");
      },
    }
  ],
  port: PORT
});



app.command("/solid-login", async ({ command, ack, body, payload }) => {

  let loginURL = `${SERVER_BASE_URL}/login?slackUUID=${command.user_id}`
  if (isUrlValid(payload.text)) {
    loginURL = `${SERVER_BASE_URL}/login?slackUUID=${command.user_id}&loginURL=${payload.text}`
  }
  await ack(loginURL)
});

app.view('YOUR_CALLBACK_ID', async ({ payload, ack, body, respond, }) => {
  const IDP = payload.state.values.IDP_BLOCK.IDP_SELECT.selected_option?.value

  let loginURL = `${SERVER_BASE_URL}/login?slackUUID=${body.user.id}`
  if (IDP && isUrlValid(IDP)) {
    loginURL = `${SERVER_BASE_URL}/login?slackUUID=${body.user.id}&loginURL=${IDP}`
  }
  await respond(loginURL)
});

// app.command('/solid-login', async ({ ack, body, client, logger }) => {
//   // Acknowledge the command request
//   await ack();

//   try {
//     // Call views.open with the built-in client
//     const result = await client.views.open({
//       // Pass a valid trigger_id within 3 seconds of receiving it
//       trigger_id: body.trigger_id,
//       // View payload
//       view: {
//         type: 'modal',
//         // View identifier
//         callback_id: 'YOUR_CALLBACK_ID',
//         title: {
//           type: 'plain_text',
//           text: 'Select IDP'
//         },
//         blocks: [
//           {
//             "type": "section",
//             "block_id": "IDP_BLOCK",
//             "text": {
//               "type": "mrkdwn",
//               "text": "Select your Prefered IDP"
//             },
//             "accessory": {
//               "action_id": "IDP_SELECT",
//               "type": "static_select",
//               "placeholder": {
//                 "type": "plain_text",
//                 "text": "Select an item"
//               },
//               "options": [
//                 {
//                   "text": {
//                     "type": "plain_text",
//                     "text": "login.inrupt.com"
//                   },
//                   "value": "https://login.inrupt.com"
//                 },
//                 {
//                   "text": {
//                     "type": "plain_text",
//                     "text": "solidcommunity.net"
//                   },
//                   "value": "https://solidcommunity.net"
//                 }
//               ]
//             }
//           }
//         ],
//         submit: {
//           type: 'plain_text',
//           text: 'Login'
//         }
//       }
//     });
//     // logger.info(result);
//   }
//   catch (error) {
//     logger.error(error);
//   }
// });

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
