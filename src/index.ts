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



app.command("/solid-login", async ({ command, ack, }) => {
  // const { team } = await app.client.team.info()

  // const slackDomain = team?.url?.replace("https://", "")

  await ack(`${SERVER_BASE_URL}/login?slackUUID=${command.user_id}`)
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
    console.log(error.message);
  }
});




(async () => {
  await app.start(PORT);
  logger.info("⚡️ Bolt app started");
  await expressApp.listen(SERVER_PORT, () => logger.info(`Running on port http://localhost:${SERVER_PORT}`));
})();
