import { SLACK_BOT_USER_TOKEN, SLACK_SIGNING_SECRET } from "./config/default";
export const baseURL = "https://8000-pondersourc-solidslackb-g76h1bqdgog.ws-eu104.gitpod.io"

export const boltConfig = {
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_USER_TOKEN,
};
