import { Session } from "@inrupt/solid-client-authn-node";

export class SessionStore {
  private sessions: Record<string, Session | undefined> = {};

  async saveSession(slackUUID: string, session: Session) {
    this.sessions[slackUUID] = session;
  }

  async getSession(slackUUID: string) {
    return this.sessions[slackUUID];
  }
  async removeSession(slackUUID: string) {
    return this.sessions[slackUUID] = undefined;
  }
}
