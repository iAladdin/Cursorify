import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CONFIG_SECTION } from "../constants";

export class VersionService {
  private historyDir = ".cursor-history";

  constructor(private outputChannel: vscode.OutputChannel) {}

  async saveVersion(rootPath: string, fileName: string, content: string) {
    try {
      const historyDir = path.join(rootPath, this.historyDir);
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      // 获取当前文件的历史版本列表
      const prefix = fileName.replace(".", "");
      const historyFiles = fs
        .readdirSync(historyDir)
        .filter((file) => file.startsWith(prefix))
        .sort((a, b) => {
          // 从文件名中提取版本号
          const versionA = parseInt(a.match(/v(\d+)/)?.[1] || "0");
          const versionB = parseInt(b.match(/v(\d+)/)?.[1] || "0");
          return versionB - versionA; // 降序排列
        });

      // 检查是否与最新版本内容相同
      if (historyFiles.length > 0) {
        const latestVersionPath = path.join(historyDir, historyFiles[0]);
        const latestContent = fs.readFileSync(latestVersionPath, "utf8");

        // 规范化内容（移除空行和空格的影响）
        const normalizedLatestContent = latestContent
          .trim()
          .replace(/\s+/g, " ");
        const normalizedNewContent = content.trim().replace(/\s+/g, " ");

        if (normalizedLatestContent === normalizedNewContent) {
          this.outputChannel.appendLine(
            `Content unchanged from latest version, skipping version creation`
          );
          return;
        }
      }

      // 确定新的版本号
      let nextVersion = 1;
      if (historyFiles.length > 0) {
        const latestVersion = parseInt(
          historyFiles[0].match(/v(\d+)/)?.[1] || "0"
        );
        nextVersion = latestVersion + 1;
      }

      // 创建新的历史文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const historyFile = path.join(
        historyDir,
        `${prefix}_v${nextVersion}_${timestamp}`
      );

      // 保存新版本
      fs.writeFileSync(historyFile, content);

      // 获取配置的最大版本数
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const maxVersions = config.get<number>("maxVersions") || 10;

      // 如果超过最大版本数，删除最旧的版本
      if (historyFiles.length >= maxVersions) {
        const filesToDelete = historyFiles.slice(maxVersions - 1);
        filesToDelete.forEach((file) => {
          const filePath = path.join(historyDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      this.outputChannel.appendLine(
        `Saved version ${nextVersion} of ${fileName} at ${timestamp}`
      );
    } catch (error) {
      this.outputChannel.appendLine(`Error saving version: ${error}`);
      throw error;
    }
  }

  getHistoryFiles(rootPath: string): string[] {
    const historyPath = path.join(rootPath, this.historyDir);
    if (!fs.existsSync(historyPath)) {
      return [];
    }
    return fs.readdirSync(historyPath);
  }

  getVersionContent(rootPath: string, versionFile: string): string {
    const historyPath = path.join(rootPath, this.historyDir);
    return fs.readFileSync(path.join(historyPath, versionFile), "utf8");
  }

  async rollbackToVersion(
    rootPath: string,
    versionFile: string
  ): Promise<void> {
    const content = this.getVersionContent(rootPath, versionFile);
    const targetFile = versionFile.split("_")[0];
    fs.writeFileSync(path.join(rootPath, "." + targetFile), content);
  }
}
