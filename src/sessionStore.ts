import { Client } from 'pg';
import { Session } from "@inrupt/solid-client-authn-node";

export class SessionStore {
  private client: Client;
  constructor() {
    this.client = new Client({
      user: 'tubs',
      password: process.env.PGPASS,
      database: 'tubs',
      host: '127.0.0.1'
    });
  }
  getClient() {
    return this.client;
  }
  async connect() {
    await this.client.connect();
  }
  async saveSession(slackUUID: string, sessionId: string) {
    return this.client.query("INSERT INTO solid ('webid', 'session') values ($1, $2)", [
      slackUUID,
      sessionId
    ]);
  }

  async getSession(slackUUID: string) {
    const res = await this.client.query("SELECT 'session' FROM solid WHERE 'webid' = $1", [ slackUUID ]);
    if (Array.isArray(res)) {
      try {

        return res[0].session;
      } catch (e) {}
    }
    return {};
  }
  async removeSession(slackUUID: string) {
    await this.client.query("DELETE FROM solid WHERE 'webid' = $1", [ slackUUID ]);
  }
}
