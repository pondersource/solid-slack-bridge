import { Client } from "pg";

export class IdentityManager {
  private pg: Client;
  constructor(pg: Client) {
    this.pg = pg;
  }
  async linkSlackToSolid(slackId: string, webId: string): Promise<void> {
    // console.log('linkSlackToSolid', slackId, webId);
    await this.pg.query(`INSERT INTO "identity" ("slack", "solid") VALUES ($1, $2)`, [ slackId, webId ]);
  }
  async unlinkSlackFromSolid(slackId: string, webId: string): Promise<void> {
    // console.log('unlinkSlackFromSolid', slackId, webId);
    await this.pg.query('DELETE FROM "identity" WHERE "slack" = $1 AND "solid" = $2', [ slackId, webId ]);
  }
  async getSlackIds(webId: string): Promise<string[]> {
    const res = await this.pg.query('SELECT "slack" FROM "identity" WHERE "solid" = $1', [ webId ]);
    return res.rows.map(row => row.slack);
  }
  async getWebIdForSlackId(slackId: string): Promise<string | undefined> {
    const res = await this.pg.query('SELECT "solid" FROM "identity" WHERE "slack" = $1', [ slackId ]);
    if (res.rowCount === 1) {
      return res.rows[0].solid;
    }
    return undefined;
  }
}
