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
  async saveSessionId(slackUUID: string, sessionId: string): Promise<void> {
    // console.log(`INSERT INTO "solid" ("webid", "session") VALUES ($1, $2)`, slackUUID, sessionId);
    await this.client.query(`INSERT INTO "solid" ("webid", "session") VALUES ($1, $2)`, [
      slackUUID,
      sessionId
    ]);
  }

  async getSessionId(slackUUID: string): Promise<string | undefined> {
    console.log(`SELECT "session" FROM "solid" WHERE "webid" = $1`, slackUUID);
    const res = await this.client.query(`SELECT "session" FROM "solid" WHERE "webid" = $1`, [ slackUUID ]);
    if (Array.isArray(res.rows)) {
      try {
        console.log('returning first hit', res.rows);
        return res.rows[0].session;
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error('no rows result?');
    }
    return undefined;
  }
  async removeSessionIds(slackUUID: string): Promise<void> {
    // console.log(`DELETE FROM solid WHERE "webid" = $1`, slackUUID);
    await this.client.query(`DELETE FROM solid WHERE "webid" = $1`, [ slackUUID ]);
  }
}
