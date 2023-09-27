import { Session } from "@inrupt/solid-client-authn-node";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";
import {
  getSolidDataset,
  isRawData
} from "@inrupt/solid-client";
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
    const datasetURLs = await getChatsIndexURLs({session, ids: channelIds});

    datasetURLs.forEach(async datasetURL => {
      try {
        const chatDataset = await getSolidDataset(datasetURL, { fetch: session.fetch });
        
        const websocket = new WebsocketNotification(
          datasetURL,
          { fetch: session.fetch }
        );
        websocket.on('message', arg => {
          console.log('WE HAVE UPDATE', arg);
        });
        websocket.connect();
      } catch (e) {
        // Assuming the error is 404: Container not yet created for this channel
      }
    });
  }

}
