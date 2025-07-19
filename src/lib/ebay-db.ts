import { Pool } from "pg";

// eBay自動化ツール専用のデータベース接続
// タスク管理ツールとは完全に分離
const ebayDbConfig = {
  connectionString: process.env.EBAY_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

class EbayDatabase {
  private static instance: EbayDatabase;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool(ebayDbConfig);
  }

  public static getInstance(): EbayDatabase {
    if (!EbayDatabase.instance) {
      EbayDatabase.instance = new EbayDatabase();
    }
    return EbayDatabase.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, params?: any[]) {
    const start = Date.now();
    const client = await this.pool.connect();

    try {
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      console.log("eBay DB Query executed", {
        text,
        duration,
        rows: res.rowCount,
      });
      return res;
    } catch (err) {
      console.error("eBay DB Query error", { text, error: err });
      throw err;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("eBay DB Transaction error", err);
      throw err;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const ebayDb = EbayDatabase.getInstance();
export default ebayDb;
