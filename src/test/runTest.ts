import * as path from "path";
import { runTests } from "vscode-test";

async function main() {
  try {
    // 测试文件所在的根目录
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    // 测试文件所在的目录
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    // 运行测试
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error("Failed to run tests:", err);
    process.exit(1);
  }
}

main();
