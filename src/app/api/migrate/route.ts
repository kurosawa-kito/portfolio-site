// 本番環境ではマイグレーションを無効化
export async function POST() {
  console.log("マイグレーションは本番環境では無効化されています");

  return Response.json(
    {
      success: false,
      message:
        "マイグレーションは本番環境では使用できません。ローカル開発環境でのみ使用してください。",
      status: 403,
    },
    { status: 403 }
  );
}
