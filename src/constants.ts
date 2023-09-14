import { SLACK_BOT_USER_TOKEN, SLACK_SIGNING_SECRET } from "./config/default";

export const EXPRESS_PORT = process.env.EXPRESS_PORT || 8000;
export const BOLT_PORT = process.env.BOLT_PORT || 12000;

export const boltConfig = {
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_USER_TOKEN,
};
