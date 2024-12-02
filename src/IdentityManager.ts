import { Client } from "pg";
import { randomBytes } from "node:crypto";

export class IdentityManager {
  private pg: Client;
  constructor(pg: Client) {
    this.pg = pg;
  }
  async getSession(home: string, id: string): Promise<string | undefined> {
    const res = await this.pg.query(`SELECT "session" from "identity" WHERE "home"=%1 AND "id"=%2`, [ home, id ]);
    if (res.rows.length === 0) {
      return undefined;
    }
    return res.rows[0].session;
  }
  async addIdentity(home: string, id: string, currentSession: string | undefined): Promise<string|undefined> {
    const sessionForHome = this.getSession(home, id);
    if (typeof currentSession === 'string') {
      if (typeof sessionForHome === 'string') { // both are set
        if (currentSession === sessionForHome) { // both are set and equal
          // nothing to do
          return sessionForHome;
        } else { // both are set and different, merge sessions, although we should offer multiple parallel sessions per account, see https://github.com/tubsproject/devlog/issues/6
          await this.pg.query(`UPDATE "identity" SET "identity" = %1 WHERE "home"=%2 AND "id"=%3`, [ currentSession, home, id ]);
          return currentSession;
        }
      } else { // only currentSession is set, link it to the identity
        await this.pg.query(`INSERT INTO "identity" ("home", "id", "session") VALUES (%1, %2, %3)`, [ home, id, currentSession ]);
        return currentSession;
      }
    } else { // no current session
      if (typeof sessionForHome === 'string') { // retrieve session based on id
        return sessionForHome;
      } else { // mint a new session, store it, and return it
        const newSession = randomBytes(16).toString('hex');
        await this.pg.query(`INSERT INTO "identity" ("home", "id", "session") VALUES (%1, %2, %3)`, [ home, id, newSession ]);
        return newSession;
      }
    }
  }
  async removeIdentity(home: string, id: string, currentSession: string) {
    await this.pg.query('DELETE FROM "identity" WHERE "home"=%1 AND "id"=%2 AND "session"=%3)', [ home, id, currentSession ]);
  }
}
