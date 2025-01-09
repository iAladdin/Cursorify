import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

suite("Cursorify Extension Test Suite", () => {
  const testWorkspacePath = path.join(
    __dirname,
    "../../..",
    "src/test/fixtures"
  );
  const historyDir = ".cursor-history";

  setup(() => {
    // 确保测试工作区存在
    if (!fs.existsSync(testWorkspacePath)) {
      fs.mkdirSync(testWorkspacePath, { recursive: true });
    }
  });

  teardown(() => {
    // 清理测试文件
    const historyPath = path.join(testWorkspacePath, historyDir);
    if (fs.existsSync(historyPath)) {
      fs.rmSync(historyPath, { recursive: true, force: true });
    }
    [".cursorrules", ".cursorignore"].forEach((file) => {
      const filePath = path.join(testWorkspacePath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  test("Initialize Cursor Configuration", async () => {
    // 执行初始化命令
    await vscode.commands.executeCommand("cursorify.initializeCursor");

    // 验证文件是否创建
    const cursorrules = path.join(testWorkspacePath, ".cursorrules");
    const cursorignore = path.join(testWorkspacePath, ".cursorignore");
    const historyPath = path.join(testWorkspacePath, historyDir);

    assert.strictEqual(
      fs.existsSync(cursorrules),
      true,
      ".cursorrules should exist"
    );
    assert.strictEqual(
      fs.existsSync(cursorignore),
      true,
      ".cursorignore should exist"
    );
    assert.strictEqual(
      fs.existsSync(historyPath),
      true,
      "history directory should exist"
    );
  });

  test("Version Control", async () => {
    // 初始化配置
    await vscode.commands.executeCommand("cursorify.initializeCursor");

    // 修改 .cursorrules 文件
    const rulesPath = path.join(testWorkspacePath, ".cursorrules");
    const versions = ["version1", "version2", "version3", "version4"];

    for (const version of versions) {
      fs.writeFileSync(rulesPath, `# ${version}\n`, "utf8");
      // 等待文件系统事件处理
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 检查历史版本数量
    const historyPath = path.join(testWorkspacePath, historyDir);
    const historyFiles = fs
      .readdirSync(historyPath)
      .filter((file) => file.startsWith(".cursorrules"));

    assert.strictEqual(
      historyFiles.length,
      3,
      "Should keep only last 3 versions"
    );
  });

  test("Rollback Configuration", async () => {
    // 初始化配置
    await vscode.commands.executeCommand("cursorify.initializeCursor");

    // 创建多个版本
    const rulesPath = path.join(testWorkspacePath, ".cursorrules");
    const testContent = "# Test Version\n";
    fs.writeFileSync(rulesPath, testContent, "utf8");

    // 等待文件系统事件处理
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 执行回滚命令
    await vscode.commands.executeCommand("cursorify.rollback");

    // 验证文件内容
    const currentContent = fs.readFileSync(rulesPath, "utf8");
    assert.strictEqual(
      currentContent.includes("Cursor Rules Configuration"),
      true
    );
  });
});
