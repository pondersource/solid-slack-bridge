import { SLACK_BOT_USER_TOKEN, SLACK_SIGNING_SECRET } from "./config/default";

const { App, ExpressReceiver } = require('@slack/bolt');

// Create a Bolt Receiver
const receiver = new ExpressReceiver({ signingSecret: SLACK_SIGNING_SECRET });

// Create the Bolt App, using the receiver
const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_USER_TOKEN,
  receiver
});

// Slack interactions are methods on app
app.event('message', async ({ event, client }: any) => {
  // Do some slack-specific stuff here
  // await client.chat.postMessage(...);
});

// Other web requests are methods on receiver.router
receiver.router.post('/secret-page', (req: any, res: any) => {
  // You're working with an express req and res now.
  res.send('yay!');
});

(async () => {
  await app.start(8080);
  console.log('app is running');
})()