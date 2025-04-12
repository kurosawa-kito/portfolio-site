/**
 * 認証関連のユーティリティ関数
 */

/**
 * Base64エンコードされたユーザー情報を検証して解析する
 * @param userBase64 Base64エンコードされたユーザー情報
 * @returns 解析されたユーザーオブジェクトまたはnull
 */
export async function validateUserBase64(userBase64: string | null): Promise<any | null> {
  if (!userBase64) {
    return null;
  }

  try {
    // Base64デコード
    const decodedStr = Buffer.from(userBase64, "base64").toString("utf-8");
    
    // JSONとしてパース
    const userData = JSON.parse(decodedStr);
    
    // 基本的な検証
    if (!userData || !userData.id || !userData.role) {
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error("ユーザー認証情報の検証エラー:", error);
    return null;
  }
} 