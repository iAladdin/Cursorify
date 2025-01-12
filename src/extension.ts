import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CommandHandler } from "./commands";
import { ExtensionContext } from "./models/types";

// 保存全局引用
let outputChannel: vscode.OutputChannel;
let commandHandler: CommandHandler;

export async function activate(context: vscode.ExtensionContext) {
  try {
    // 创建输出通道
    const outputChannel = vscode.window.createOutputChannel("Cursorify");
    outputChannel.appendLine("Initializing Cursorify extension...");

    // 初始化命令处理器
    const extensionContext = { outputChannel, context };
    const commandHandler = new CommandHandler(extensionContext);
    commandHandler.registerCommands();

    outputChannel.appendLine("Cursorify extension activated successfully");
  } catch (err: any) {
    const error = err as Error;
    console.error(`Activating extension failed: ${error.message}`);
  }
}

export function deactivate() {
  try {
    // 清理资源
    const outputChannel = vscode.window.createOutputChannel("Cursorify");
    outputChannel.dispose();
    outputChannel.appendLine("Cursorify extension deactivated");
  } catch (err: any) {
    const error = err as Error;
    console.error(`Deactivating extension failed: ${error.message}`);
  }
}
