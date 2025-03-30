// import { sql } from "@vercel/postgres";
// import bcrypt from "bcrypt";

// export async function POST() {
//   try {
//     // 管理者ユーザーのパスワードをハッシュ化
//     const adminPassword = await bcrypt.hash("admin123", 10);
//     const userPassword = await bcrypt.hash("user123", 10);

//     // 既存のユーザーを削除
//     await sql`DELETE FROM users;`;

//     // 管理者ユーザーを追加
//     await sql`
//       INSERT INTO users (username, email, password, role)
//       VALUES ('admin', 'admin@example.com', ${adminPassword}, 'admin');
//     `;

//     // 一般ユーザーを追加
//     await sql`
//       INSERT INTO users (username, email, password, role)
//       VALUES ('user', 'user@example.com', ${userPassword}, 'member');
//     `;

//     // サンプルプロジェクトを追加
//     await sql`
//       INSERT INTO projects (name, description, start_date, end_date)
//       VALUES ('サンプルプロジェクト', 'これはサンプルプロジェクトです', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month');
//     `;

//     return Response.json({
//       success: true,
//       message: "シードデータが正常に作成されました",
//     });
//   } catch (error) {
//     console.error("シードデータの作成中にエラーが発生しました:", error);
//     return Response.json(
//       { success: false, message: "シードデータの作成中にエラーが発生しました" },
//       { status: 500 }
//     );
//   }
// }
