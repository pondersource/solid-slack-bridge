import { Session } from "@inrupt/solid-client-authn-node";

export class SessionStore {
  private sessions: Record<string, Session> = {};

  async saveSession(slackUUID: string, session: Session) {
    this.sessions[slackUUID] = session;
  }

  async getSession(slackUUID: string) {
    return this.sessions[slackUUID];
  }
}
