import { Session } from "@inrupt/solid-client-authn-node";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";
import { getChatsIndexURLs } from "./utils";
import { slackApp } from "./slackApp";

export class SessionStore {
  private sessions: Record<string, Session> = {};

  async saveSession(slackUUID: string, session: Session) {
    this.sessions[slackUUID] = session;

    this.listen(slackUUID, session);
  }

  async getSession(slackUUID: string) {
    return this.sessions[slackUUID];
  }

  async listen(slackUUID: string, session: Session) {
    //const chatNames = getAllsChats({session: session});

    const {channels} = await slackApp.client.conversations.list({
      types: 'public_channel, private_channel, mpim, im'
    });

    const channelIds: string[] = channels ? channels.map(channel => channel.id ? channel.id : '') : [];
    const datasetURLs = getChatsIndexURLs({session, ids: channelIds});

    // if ()
    // const websocket = new WebsocketNotification(
    //   containerUrl,
    //   { fetch: fetch }
    // );
  }

}
