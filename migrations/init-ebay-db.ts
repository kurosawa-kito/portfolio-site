// eBay自動化ツール専用データベース初期化スクリプト

import { config } from "dotenv";
import { ebayDb } from "../src/lib/ebay-db";
import fs from "fs";
import path from "path";

// 環境変数を読み込み
config({ path: path.join(__dirname, "..", ".env.local") });

async function initializeEbayDatabase() {
  try {
    console.log("🚀 eBay自動化ツール データベース初期化開始...");

    // 環境変数の確認
    console.log("🔍 環境変数チェック:");
    console.log(
      "- EBAY_DATABASE_URL:",
      process.env.EBAY_DATABASE_URL ? "設定済み" : "未設定",
    );
    console.log(
      "- DATABASE_URL:",
      process.env.DATABASE_URL ? "設定済み" : "未設定",
    );
    console.log("- NODE_ENV:", process.env.NODE_ENV || "development");

    // スキーマファイルを読み込み
    const schemaPath = path.join(__dirname, "ebay-automation-schema.sql");
    console.log("📂 スキーマファイルを読み込み中:", schemaPath);

    if (!fs.existsSync(schemaPath)) {
      console.error("❌ スキーマファイルが見つかりません:", schemaPath);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, "utf8");

    // スキーマを実行（複数のSQLステートメントを分割して実行）
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📊 ${statements.length}個のSQLステートメントを実行中...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await ebayDb.query(statement);
          console.log(`✅ ステートメント ${i + 1}/${statements.length} 完了`);
        } catch (error: any) {
          // テーブルが既に存在する場合のエラーは無視
          if (error.code === "42P07") {
            console.log(`ℹ️  テーブル既存 (${i + 1}/${statements.length})`);
          } else {
            console.error(`❌ ステートメント ${i + 1} エラー:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log("✅ データベーススキーマが正常に作成されました");

    // テストユーザーを作成（開発環境のみ）
    if (process.env.NODE_ENV !== "production") {
      await createTestUsers();
    }

    console.log("🎉 eBay自動化ツール データベース初期化完了");
  } catch (error) {
    console.error("❌ データベース初期化エラー:", error);
    process.exit(1);
  } finally {
    await ebayDb.close();
  }
}

async function createTestUsers() {
  console.log("👤 テストユーザーを作成中...");

  const bcrypt = require("bcryptjs");

  const testUsers = [
    {
      username: "ebayuser",
      email: "ebayuser@example.com",
      password: await bcrypt.hash("password123", 12),
      fullName: "eBay Test User",
    },
    {
      username: "admin",
      email: "admin@ebay-automation.com",
      password: await bcrypt.hash("admin123", 12),
      fullName: "eBay Admin User",
    },
  ];

  for (const user of testUsers) {
    try {
      const result = await ebayDb.query(
        `
        INSERT INTO ebay_users (username, email, password_hash, full_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `,
        [user.username, user.email, user.password, user.fullName],
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].id;

        // デフォルト設定を作成
        await ebayDb.query(
          `
          INSERT INTO ebay_user_settings (user_id)
          VALUES ($1)
          ON CONFLICT DO NOTHING
        `,
          [userId],
        );

        console.log(`✅ テストユーザー作成: ${user.username} (${user.email})`);
      } else {
        console.log(`ℹ️  テストユーザー既存: ${user.username} (${user.email})`);
      }
    } catch (error: any) {
      console.error(
        `❌ テストユーザー作成エラー (${user.username}):`,
        error.message,
      );
    }
  }
}

// スクリプト実行
if (require.main === module) {
  initializeEbayDatabase();
}

export { initializeEbayDatabase };
