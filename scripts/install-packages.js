import { execSync } from "child_process"

console.log("🚀 パッケージのインストールを開始します...")

try {
  // npm cache をクリア
  console.log("📦 npm cache をクリアしています...")
  execSync("npm cache clean --force", { stdio: "inherit" })

  // node_modules を削除（存在する場合）
  console.log("🗑️  既存の node_modules を削除しています...")
  execSync("rm -rf node_modules package-lock.json", { stdio: "inherit" })

  // パッケージをインストール
  console.log("📥 パッケージをインストールしています...")
  execSync("npm install", { stdio: "inherit" })

  console.log("✅ パッケージのインストールが完了しました！")
  console.log("🎉 次のコマンドでアプリケーションを起動できます: npm run dev")
} catch (error) {
  console.error("❌ インストール中にエラーが発生しました:", error.message)
  process.exit(1)
}
