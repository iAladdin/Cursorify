import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CommandHandler } from "./commands";
import { ExtensionContext } from "./models/types";

// 保存全局引用
let outputChannel: vscode.OutputChannel;
let commandHandler: CommandHandler;

export function activate(context: vscode.ExtensionContext) {
  // 初始化输出通道
  outputChannel = vscode.window.createOutputChannel("Cursorify");
  context.subscriptions.push(outputChannel);

  // 创建扩展上下文
  const extensionContext: ExtensionContext = {
    outputChannel,
    context,
  };

  // 初始化命令处理器
  commandHandler = new CommandHandler(extensionContext);
  commandHandler.registerCommands();

  outputChannel.appendLine("Cursorify extension activated");
}

export async function deactivate() {
  try {
    // 清理输出通道
    if (outputChannel) {
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

    outputChannel?.appendLine("Cursorify extension deactivated");
  } catch (error) {
    console.error("Error during deactivation:", error);
  }
}
