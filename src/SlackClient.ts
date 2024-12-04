import { App as BoltApp } from "@slack/bolt";
import { randomBytes } from "node:crypto";
import { Request, Response } from "express";
import { Solid } from "@tubsproject/solid";
import { Client } from "pg";
import { BOLT_PORT } from "./config/default";
import { IMessage } from "./types";
import { createUserMessage, isUrlValid } from "./utils";
import { logger } from "./utils/logger";
import { IdentityManager } from "./IdentityManager";
import { SessionStore } from "./sessionStore";

function getSessionId(req: Request): string {
  if (typeof req.session?.id !== 'string') {
    req.session!.id = randomBytes(16).toString('hex');
  }
  return req.session!.id;
}

export class SlackClient {
  private boltApp: BoltApp;
  private logins: { [nonce: string]: { user_id: string, team_id: string } } = {};
  private logouts: { [nonce: string]: { user_id: string, team_id: string } } = {};
  private identityManager: IdentityManager;
  private sessionStore: SessionStore;
  private solidClient: Solid;
  constructor(identityManager: IdentityManager, sessionStore: SessionStore, solidClient: Solid) {
    this.identityManager = identityManager;
    this.sessionStore = sessionStore;
    this.solidClient = solidClient;
    this.boltApp = new BoltApp({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      token: process.env.SLACK_BOT_USER_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      socketMode: true,
      port: BOLT_PORT
    });
  }
  
  async create(EXPRESS_FULL_URL: string) {
    this.boltApp.command("/tubs-connect", async ({ command, ack, body, payload }) => {
      const { user_id, team_id } = command;
      const nonce = randomBytes(16).toString('hex');
      this.logins[nonce] = { user_id, team_id };
      let loginURL = `${EXPRESS_FULL_URL}/slack/login?nonce=${nonce}`
      await ack(loginURL)
    });
    
    
    this.boltApp.command("/tubs-disconnect", async ({ command, ack, body, payload }) => {
      const { user_id, team_id } = command;
      const nonce = randomBytes(16).toString('hex');
      this.logouts[nonce] = { user_id, team_id };
      let logoutURL = `${EXPRESS_FULL_URL}/slack/logout?nonce=${nonce}`
      await ack(logoutURL)
    });
    
    
    this.boltApp.message(async ({ message, say, context }) => {
      try {

        logger.info("----------onMessage-----------");
        
        // Get workspace id
        const { team } = await this.boltApp.client.team.info()
        console.log({ team });
        // Get members of this Slack conversation
        const { members } = await this.boltApp.client.conversations.members({ channel: message.channel });
        console.log({ members });
        
        // Slack user ID of the message sender
        const slackUUID = (message as IMessage).user;
        console.log({ slackUUID });
        
        // Get the Solid session for this user if we have one
        
        console.log('getting webId for SlackId', slackUUID);
        const webId = await this.identityManager.getWebIdForSlackId(slackUUID);
        console.log('got webId for SlackId', webId);
        console.log({ webId });
        
        if (typeof webId !== 'string') {
          return;
        }
        const sessionId = await this.sessionStore.getSessionId(webId);
        // User's Slack profile info is used to look for their Solid webId
        const userInfo = await this.boltApp.client.users.info({ user: slackUUID })
        const statusTextAsWebId = userInfo.user?.profile?.status_text ?? ""
        
        // Default maker points to user's profile on Slack
        let maker: string | undefined = `${team?.url}team/${slackUUID}`
        console.log({ maker });
        
        if (webId) {
          // If we have the session, we know exactly who the maker is
          maker = webId
          console.log({ maker, webId });
        } else if (isUrlValid(statusTextAsWebId)) {
          // Otherwise if it is indeed a web URL we trust that the user is not lying about their identity
          maker = statusTextAsWebId
          console.log({ maker, statusTextAsWebId });
        }
        
        try {
          // Create a copy of the message in the pods of all the members of the conversation who have a
          // Solid session with us.
          console.log({ members });
          members?.forEach(async (member) => {
            const memberWebId = await this.identityManager.getWebIdForSlackId(member);
            if (typeof memberWebId !== 'string') {
              return;
            }
            const memberSessionId = await this.sessionStore.getSessionId(memberWebId);
            if (typeof memberSessionId === 'undefined') {
              return;
            }
            const memberSession = await this.solidClient.getSession(memberSessionId);
            
            // Member has active session, so we write to the pod
            if (memberSession) {
              console.log('creating user message', memberWebId, memberSession, maker, message);
              await createUserMessage({ session: memberSession as any, maker, messageBody: message as IMessage });
            }
          });
        } catch (error: any) {
          logger.error(error.message);
        }
      } catch (e) {
        console.error('failed to handle Slack message', e);
      }
    });
  }
  start(port: number) {
    return this.boltApp.start(port);
  }
  async handleLogin(webId: string, req: Request, res: Response) {
    const nonce = req.query.nonce as string;
    const { user_id, team_id } = this.logins[nonce];
    if ((typeof user_id === 'string') && (typeof team_id === 'string')) {
      const slackId = `${team_id}:${user_id}`;
      // console.log(`nonce ${nonce} matched Slack ID ${slackId}; linking it to webId ${webId}`);
      await this.identityManager.linkSlackToSolid(slackId, webId);
      res.status(200).send(`Your Slack ID ${slackId} is now linked to your webId ${webId}. Go <a href="/">home</a>.`);
    } else {
      res.status(200).send(`Could not link your Slack identity base on nonce. Go <a href="/">home</a>.`);
    }
  }
  handleLogout(webId: string, req: Request, res: Response) {
    const nonce = req.query.nonce as string;
    const { user_id, team_id } = this.logouts[nonce];
    if ((typeof user_id === 'string') && (typeof team_id === 'string')) {
      const slackId = `${team_id}:${user_id}`;
      this.identityManager.unlinkSlackFromSolid(slackId, webId);
      res.status(200).send(`Your Slack identity ${slackId} is now unlinked to your webId ${webId}. Go <a href="/">home</a>.`);
    } else {
      res.status(200).send(`Link expired. Please type <tt>/tubs-connect</tt> in a Slack workspace that has <a href="https://api.slack.com/apps/A080HGBNZAA">our app</a> installed to retry. Go <a href="/">home</a>.`);
    }
  }
}
