import { App as BoltApp } from "@slack/bolt";
import { randomBytes } from "node:crypto";
import { Request, Response } from "express";
import { BOLT_PORT } from "./config/default";
import { IMessage } from "./types";
import { createUserMessage, isUrlValid } from "./utils";
import { logger } from "./utils/logger";
import { SessionStore } from "./sessionStore";

export class SlackClient {
  private boltApp: BoltApp;
  private logins: { [nonce: string]: string } = {};
  private logouts: { [nonce: string]: string } = {};
  constructor() {
    this.boltApp = new BoltApp({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      token: process.env.SLACK_BOT_USER_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      socketMode: true,
      port: BOLT_PORT
    });
  }
  
  async create(sessionStore: SessionStore, EXPRESS_FULL_URL: string) {
    this.boltApp.command("/tubs-connect", async ({ command, ack, body, payload }) => {
      const uuid = command.user_id;
      const nonce = randomBytes(16).toString('hex');
      this.logins[nonce] = uuid;
      let loginURL = `${EXPRESS_FULL_URL}/slack/login?nonce=${nonce}`
      await ack(loginURL)
    });
    
    
    this.boltApp.command("/tubs-disconnect", async ({ command, ack, body, payload }) => {
      const uuid = command.user_id;
      const nonce = randomBytes(16).toString('hex');
      this.logouts[nonce] = uuid;
      let logoutURL = `${EXPRESS_FULL_URL}/slack/logout?nonce=${nonce}`
      await ack(logoutURL)
    });
    
    
    this.boltApp.message(async ({ message, say, context }) => {
      logger.info("----------onMessage-----------");
      
      // Get workspace id
      const { team } = await this.boltApp.client.team.info()
      
      // Get members of this Slack conversation
      const { members } = await this.boltApp.client.conversations.members({ channel: message.channel });
      
      // Slack user ID of the message sender
      const slackUUID = (message as IMessage).user;
      
      // Get the Solid session for this user if we have one
      const session = await sessionStore.getSession(slackUUID);
      
      // User's Slack profile info is used to look for their Solid webId
      const userInfo = await this.boltApp.client.users.info({ user: slackUUID })
      const statusTextAsWebId = userInfo.user?.profile?.status_text ?? ""
      
      // Default maker points to user's profile on Slack
      let maker: string | undefined = `${team?.url}team/${slackUUID}`
      
      if (session) {
        // If we have the session, we know exactly who the maker is
        maker = session.info.webId
      } else if (isUrlValid(statusTextAsWebId)) {
        // Otherwise if it is indeed a web URL we trust that the user is not lying about their identity
        maker = statusTextAsWebId
      }
      
      try {
        // Create a copy of the message in the pods of all the members of the conversation who have a
        // Solid session with us.
        members?.forEach(async (member) => {
          let memberSession = await sessionStore.getSession(member);
          
          // Member has active session, so we write to the pod
          if (memberSession) {
            await createUserMessage({ session: memberSession, maker, messageBody: message as IMessage });
          }
        });
      } catch (error: any) {
        logger.error(error.message);
      }
    });
  }
  start(port: number) {
    return this.boltApp.start(port);
  }
  handleLogin(req: Request, res: Response) {
    const nonce = req.query.nonce as string;
    if (typeof this.logins[nonce] === 'string') {
      res.status(200).send(`Adding your Slack identity ${this.logins[nonce]}`);
    } else {
      res.status(200).send(`Could not link your Slack identity base on nonce`);
    }
  }
  handleLogout(req: Request, res: Response) {
    const nonce = req.query.nonce as string;
    if (typeof this.logouts[nonce] === 'string') {
      res.status(200).send(`Removing your Slack identity ${this.logouts[nonce]}`);
    } else {
      res.status(200).send(`Could not link your Slack identity base on nonce`);
    }
  }
}
