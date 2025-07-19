import { NextRequest, NextResponse } from "next/server";

/**
 * タスク分析APIエンドポイント
 * Gemini APIを使用してタスクデータを分析し、結果を返します
 *
 * @param request - NextRequestオブジェクト
 * @returns タスク分析結果を含むレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディからタスクデータを取得
    const { taskData } = await request.json();

    // タスクデータのバリデーション
    if (!taskData) {
      return NextResponse.json(
        {
          success: false,
          message: "タスクデータが提供されていません",
        },
        { status: 400 },
      );
    }

    // Gemini APIキーを環境変数から取得
    const apiKey = process.env.GEMINI_API_KEY || "";

    // APIキーのバリデーション
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Gemini APIキーが設定されていません",
        },
        { status: 500 },
      );
    }

    // デバッグ用にAPIキーの形式をチェック（実際のキーは出力しない）
    console.log("APIキープレフィックス:", apiKey.substring(0, 7));

    // Gemini APIのエンドポイント - gemini-1.5-flashモデルを使用
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    try {
      /**
       * Geminiに渡すプロンプト
       * 以下の形式で構成:
       * 1. システム指示: タスク管理アシスタントとしての役割を定義
       * 2. ユーザー指示: タスクデータの分析を依頼
       *
       * タスクデータはJSON文字列として渡されます
       */
      const promptText = `あなたはタスク管理アシスタントです。チームリーダーが部下のタスク状況を把握するために、以下の点に注目して部下のタスクデータを総合的に分析し、日本語で詳細かつ実用的なフィードバックを提供してください。

        ### タスクの重さ（推定日数）の推測
        - タスクのタイトルからその重さ（推定日数）を推測してください。以下の例を参考に、キーワードやパターンに基づいて推定日数を割り当ててください：
          - 「レポート作成」：3日
          - 「会議準備」：1日
          - 「データ分析」：5日
          - 「クライアント対応」：2日
          - 「システム開発」：10日
        - 上記の例に当てはまらないタスクについては、類似のタスクやキーワードに基づいて適切な推定日数を割り当ててください。

        ### 分析のポイント
        1. **タスク全体の状況を総合的に分析**し、部下のタスク管理の全体像を把握してください。
        2. **タスクの優先度分布（高・中・低の割合）と期限の近さ**に基づくリスク評価を行ってください。
        3. **部下の現在のワークロード状況**（全体のタスク量、締め切りの集中度、推定日数に基づく負荷など）を分析してください。
        4. **今後のリスク予測**（期限に間に合わない可能性が高いタスク、優先度の高いタスクの集中など）を行い、注意が必要な点を指摘してください。
        5. **具体的な改善提案**（タスクの優先順位付け、リソース配分の最適化、スケジュール調整など）を提供してください。

        ### 総合的な洞察
        - タスクのタイトルから推測した重さ（推定日数）を考慮し、部下のタスク負荷を評価してください。
        - **現在最も注意を払うべきタスク**とその理由を特定してください。
        - 短期的（1週間以内）、中期的（1ヶ月以内）のタスク完了見込みと課題を分析してください。
        - タスク管理で改善できる点（時間管理、優先度設定など）を指摘してください。
        - 特に問題になりそうなタスクや期間について警告してください。
        - 部下の手が空きそうなのか、忙しいのかを推測し、サポートが必要かどうかを判断してください。

        ### レスポンスの構成
        レスポンスはマークダウン形式で、以下のように構成してください：
        - 大見出しには「## 」を使用（例：## 1. タスク状況全体分析）
        - 小見出しには「### 」を使用
        - 重要なポイントは「**太字**」で強調
        - 箇条書きには「- 」を使用
        - 番号付きリストには「1. 」「2. 」などを使用
        - 表を使用する場合は以下のようなマークダウン形式の表を使用してください（行と行の間に空行を入れないでください）：
          \`\`\`
          | 列1 | 列2 | 列3 |
          |-----|-----|-----|
          | データ1 | データ2 | データ3 |
          | データ4 | データ5 | データ6 |
          \`\`\`
        - コードやコマンドは「\`」で囲む

        ### セクションの詳細
        1. **## 1. タスク状況全体分析**
        - 部下のタスクの全体的な状況をまとめ、主要な特徴や傾向を指摘してください。
        
        2. **## 2. タスクの優先度と期限に基づくリスク評価**
        - 優先度ごとのタスク数と、期限が近いタスクのリスクを評価してください。
        - 推定日数と期限を比較し、遅延リスクのあるタスクを特定してください。
        
        3. **## 3. 現在のワークロード状況**
        - 部下の現在のタスク量と推定日数から、ワークロードの重さを評価してください。
        - 締め切りの集中度や、タスクの重なり具合を分析してください。
        
        4. **## 4. 今後のリスク予測**
        - 今後1週間、1ヶ月以内に注意が必要なタスクや期間を予測してください。
        - 優先度の高いタスクの集中や、推定日数が長いタスクの影響を考慮してください。
        
        5. **## 5. 具体的な改善提案**
        - タスクの優先順位付けやスケジュール調整に関する具体的なアドバイスを提供してください。
        - 部下のタスク管理を改善するためのヒントや、サポートが必要な点を提案してください。
        
        6. **## 総括**
        - 最も重要なポイントを3点程度にまとめ、チームリーダーが部下の状況を把握しやすくなるようにしてください。

        この部下のタスクデータを分析してください: ${JSON.stringify(taskData)}`;

      // Gemini APIリクエストボディの作成
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7, // 創造性の度合い (0.0-1.0)
          maxOutputTokens: 1500, // 最大出力トークン数を増やす
        },
      };

      // Gemini APIを呼び出す
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // エラーレスポンスの処理
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini APIエラー:", errorData);
        throw new Error(
          `Gemini APIリクエスト失敗: ${response.status} ${JSON.stringify(
            errorData,
          )}`,
        );
      }

      // レスポンスデータの解析
      const data = await response.json();

      // レスポンス検証
      if (!data.candidates || !data.candidates[0]) {
        throw new Error("Gemini APIからの応答が無効です");
      }

      // Gemini APIのレスポンス形式から分析テキストを抽出
      const analysisText =
        data.candidates[0].content.parts[0].text || "分析結果がありません";

      // 成功レスポンスを返す
      return NextResponse.json({
        success: true,
        analysis: analysisText,
      });
    } catch (apiError: any) {
      // API呼び出し中のエラー処理
      console.error("API呼び出しエラー:", apiError);
      throw apiError;
    }
  } catch (error: any) {
    // 全体的なエラー処理
    console.error("AI分析エラー:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Gemini APIへのアクセス中にエラーが発生しました：" + error.message,
        error: error.toString(),
      },
      { status: 500 },
    );
  }
}
