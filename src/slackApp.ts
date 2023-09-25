import 'dotenv/config';
import { App } from "@slack/bolt";

export const slackApp: App = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_USER_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
  });