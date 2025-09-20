import { execSync } from "child_process"

console.log("🚀 デプロイメント問題を修正しています...")

try {
  // パッケージキャッシュをクリア
  console.log("📦 パッケージキャッシュをクリアしています...")
  execSync("rm -rf node_modules package-lock.json pnpm-lock.yaml", { stdio: "inherit" })

  // 依存関係を再インストール
  console.log("📥 依存関係を再インストールしています...")
  execSync("npm install", { stdio: "inherit" })

  // ビルドテスト
  console.log("🔨 ビルドテストを実行しています...")
  execSync("npm run build", { stdio: "inherit" })

  console.log("✅ デプロイメント修正が完了しました！")
  console.log("🎉 Vercelに再デプロイできます")
} catch (error) {
  console.error("❌ 修正中にエラーが発生しました:", error.message)
  process.exit(1)
}
