import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CommandHandler } from "./commands";
import { ExtensionContext } from "./models/types";

// 保存全局引用
let outputChannel: vscode.OutputChannel;
let commandHandler: CommandHandler;

export async function activate(context: vscode.ExtensionContext) {
  // 立即显示通知，确认激活函数被调用
  vscode.window.showInformationMessage("Cursorify 开始激活...");
  console.log("Cursorify: 开始激活扩展");

  try {
    // 初始化输出通道
    outputChannel = vscode.window.createOutputChannel("Cursorify");
    outputChannel.show(true); // 强制显示输出通道
    outputChannel.appendLine("=== Cursorify Extension Activation Log ===");
    outputChannel.appendLine(`Activation Time: ${new Date().toISOString()}`);

    // 记录环境信息
    outputChannel.appendLine("\nEnvironment Information:");
    outputChannel.appendLine(`VSCode Version: ${vscode.version}`);
    outputChannel.appendLine(`Extension Path: ${context.extensionPath}`);
    outputChannel.appendLine(
      `Global Storage Path: ${context.globalStorageUri.fsPath}`
    );

    // 创建扩展上下文
    const extensionContext: ExtensionContext = {
      outputChannel,
      context,
    };

    // 初始化命令处理器
    outputChannel.appendLine("\nInitializing Command Handler...");
    commandHandler = new CommandHandler(extensionContext);

    // 注册所有命令
    outputChannel.appendLine("Registering commands...");
    commandHandler.registerCommands();
    outputChannel.appendLine("Commands registered successfully");

    // 添加到订阅列表
    context.subscriptions.push(outputChannel);

    // 显示成功消息
    outputChannel.appendLine("\nCursorify extension activated successfully!");
    vscode.window.showInformationMessage("Cursorify 已激活，可以使用了！");

    console.log("Cursorify: 扩展激活成功");
  } catch (err: any) {
    // 错误处理
    const error = err as Error;
    console.error("Cursorify: 激活失败:", error);
    outputChannel?.appendLine(`\nActivation Error: ${error.message}`);
    outputChannel?.appendLine(error.stack || "No stack trace available");
    vscode.window.showErrorMessage(`Cursorify 激活失败: ${error.message}`);

    // 确保在错误情况下也显示输出通道
    outputChannel?.show(true);
  }
}

export async function deactivate() {
  try {
    console.log("Cursorify: 开始停用扩展");
    outputChannel?.appendLine("\nDeactivating Cursorify extension...");

    // 清理输出通道
    if (outputChannel) {
      outputChannel.appendLine("Disposing output channel...");
      outputChannel.dispose();
    }

    // 清理缓存
    if (commandHandler) {
      const context = commandHandler.getContext();
      if (context) {
        const cachePath = path.join(
          context.globalStorageUri.fsPath,
          "awesome-cursorrules"
        );
        if (fs.existsSync(cachePath)) {
          outputChannel?.appendLine(
            `Cleaning up cache directory: ${cachePath}`
          );
          fs.rmSync(cachePath, { recursive: true, force: true });
        }
      }
    }

    outputChannel?.appendLine("Cursorify extension deactivated successfully");
    console.log("Cursorify: 扩展停用成功");
  } catch (err: any) {
    const error = err as Error;
    console.error("Cursorify: 停用时发生错误:", error);
    outputChannel?.appendLine(`Deactivation Error: ${error.message}`);
    vscode.window.showErrorMessage(
      `Cursorify 停用时发生错误: ${error.message}`
    );
  }
}
