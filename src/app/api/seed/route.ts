// 本番環境ではシーダーを無効化
export async function POST() {
  console.log("シーダーは本番環境では無効化されています。");

  return Response.json(
    {
      success: false,
      message:
        "シーダーは本番環境では使用できません。ローカル開発環境でのみ使用してください。",
      status: 403,
    },
    { status: 403 }
  );
}

// 以下は元のシーダーコードをすべて削除
