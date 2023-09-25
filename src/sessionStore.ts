import { Session } from "@inrupt/solid-client-authn-node";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";
import { getAllsChats } from "./utils";

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
    const chatNames = getAllsChats({session: session});
    // const websocket = new WebsocketNotification(
    //   containerUrl,
    //   { fetch: fetch }
    // );
  }

}
