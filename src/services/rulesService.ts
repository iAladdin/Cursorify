import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import simpleGit from "simple-git";
import { RuleTemplate, RulesCache } from "../models/types";
import { CACHE_DURATION } from "../constants";

export class RulesService {
  constructor(private outputChannel: vscode.OutputChannel) {}

  async searchRules(
    technology: string,
    context: vscode.ExtensionContext
  ): Promise<RuleTemplate[]> {
    try {
      this.outputChannel.appendLine(
        `Searching rules for technology: ${technology}`
      );
      let cache = await this.getRulesCache(context);

      if (
        !cache ||
        !fs.existsSync(cache.repoPath) ||
        Date.now() - cache.lastUpdate > CACHE_DURATION
      ) {
        this.outputChannel.appendLine(
          "Cache expired or not found, updating..."
        );
        await this.updateRulesCache(context);
        // 重新获取更新后的缓存
        cache = await this.getRulesCache(context);

        // 如果更新后仍然没有缓存，抛出错误
        if (!cache) {
          throw new Error("Failed to initialize cache");
        }
      }

      const rulesPath = path.join(cache.repoPath, "rules");

      // 检查 rules 目录是否存在
      if (!fs.existsSync(rulesPath)) {
        throw new Error(`Rules directory not found at: ${rulesPath}`);
      }

      const keywords = technology.toLowerCase().split(/\s+/);
      this.outputChannel.appendLine(`Keywords: ${keywords.join(", ")}`);

      const templates: RuleTemplate[] = [];
      const directories = fs.readdirSync(rulesPath);

      for (const dir of directories) {
        const dirPath = path.join(rulesPath, dir);
        if (fs.statSync(dirPath).isDirectory()) {
          try {
            // 解析目录名称以获取标签
            const tags = dir
              .split("-")
              .filter(
                (tag) =>
                  tag !== "cursorrules" && tag !== "prompt" && tag !== "file"
              )
              .map((tag) => tag.toLowerCase());

            // 检查是否匹配搜索关键词
            const isMatch = keywords.some(
              (keyword) =>
                tags.some((tag) => tag.includes(keyword)) ||
                dir.toLowerCase().includes(keyword)
            );

            if (isMatch) {
              // 查找 .cursorrules 文件
              const rulesFile = fs
                .readdirSync(dirPath)
                .find(
                  (file) =>
                    file.toLowerCase() === ".cursorrules" ||
                    file.toLowerCase().endsWith(".cursorrules")
                );

              if (rulesFile) {
                const content = fs.readFileSync(
                  path.join(dirPath, rulesFile),
                  "utf8"
                );
                templates.push({
                  name: dir,
                  description: `${tags.join(" ")} template`,
                  content: content,
                  tags: tags,
                });
                this.outputChannel.appendLine(`Added template from: ${dir}`);
              }
            }
          } catch (error) {
            this.outputChannel.appendLine(
              `Error processing directory ${dir}: ${error}`
            );
            continue;
          }
        }
      }

      this.outputChannel.appendLine(
        `Found ${templates.length} matching templates`
      );
      return templates;
    } catch (error) {
      this.outputChannel.appendLine(`Error searching rules: ${error}`);
      throw error;
    }
  }

  async updateRulesCache(context: vscode.ExtensionContext): Promise<void> {
    try {
      this.outputChannel.appendLine("Updating rules cache...");
      const repoUrl = "https://github.com/PatrickJS/awesome-cursorrules.git";
      const repoPath = path.join(
        context.globalStorageUri.fsPath,
        "awesome-cursorrules"
      );

      // 确保目录存在
      if (!fs.existsSync(context.globalStorageUri.fsPath)) {
        fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
      }

      // 使用进度条显示操作进度
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: fs.existsSync(repoPath)
            ? "Updating rules..."
            : "Downloading rules...",
          cancellable: false,
        },
        async (progress) => {
          let progressStep = 0;

          // 如果仓库已存在，执行 pull；否则执行 clone
          if (fs.existsSync(repoPath)) {
            this.outputChannel.appendLine(
              "Repository exists, pulling updates..."
            );
            const git = simpleGit(repoPath);

            // 配置进度回调
            git.outputHandler((command, stdout, stderr) => {
              stdout.on("data", (data) => {
                const message = data.toString();
                this.outputChannel.appendLine(message);
                progress.report({
                  message: "Updating...",
                  increment: 20,
                });
              });
            });

            await git.pull();
          } else {
            this.outputChannel.appendLine("Cloning repository...");
            const git = simpleGit();

            // 配置进度回调
            git.outputHandler((command, stdout, stderr) => {
              stdout.on("data", (data) => {
                const message = data.toString();
                this.outputChannel.appendLine(message);

                if (message.includes("Receiving objects:")) {
                  const match = message.match(/Receiving objects:\s+(\d+)%/);
                  if (match) {
                    const percentage = parseInt(match[1], 10);
                    const increment = percentage - progressStep;
                    if (increment > 0) {
                      progress.report({
                        message: `Downloading... ${percentage}%`,
                        increment,
                      });
                      progressStep = percentage;
                    }
                  }
                } else if (message.includes("Resolving deltas:")) {
                  const match = message.match(/Resolving deltas:\s+(\d+)%/);
                  if (match) {
                    const percentage = parseInt(match[1], 10);
                    progress.report({
                      message: `Processing... ${percentage}%`,
                      increment: 0,
                    });
                  }
                }
              });
            });

            await git.clone(repoUrl, repoPath);
          }

          // 更新缓存信息
          await context.globalState.update("rulesCache", {
            lastUpdate: Date.now(),
            repoPath: repoPath,
          });

          this.outputChannel.appendLine("Cache update completed");
        }
      );
    } catch (error) {
      this.outputChannel.appendLine(`Failed to update rules cache: ${error}`);
      throw error;
    }
  }

  async getRulesCache(
    context: vscode.ExtensionContext
  ): Promise<RulesCache | undefined> {
    return context.globalState.get<RulesCache>("rulesCache");
  }

  async clearCache(context: vscode.ExtensionContext): Promise<void> {
    try {
      const cache = await this.getRulesCache(context);

      // 如果存在本地仓库，删除它
      if (cache && fs.existsSync(cache.repoPath)) {
        this.outputChannel.appendLine(
          `Removing repository at: ${cache.repoPath}`
        );
        fs.rmSync(cache.repoPath, { recursive: true, force: true });
      }

      await context.globalState.update("rulesCache", undefined);
      this.outputChannel.appendLine("Cache cleared successfully");
    } catch (error) {
      this.outputChannel.appendLine(`Error clearing cache: ${error}`);
      throw error;
    }
  }
}
