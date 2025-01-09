import * as vscode from "vscode";
import * as path from "path";
import { ExtensionContext } from "../models/types";
import { TemplateService } from "../services/templateService";
import { VersionService } from "../services/versionService";
import { RulesService } from "../services/rulesService";
import {
  CONFIG_SECTION,
  CONFIG_DEFAULT_RULES_TEMPLATE,
  CONFIG_DEFAULT_IGNORE_TEMPLATE,
} from "../constants";
import { TemplateCommands } from "./templateCommands";

export class CommandHandler {
  private templateService: TemplateService;
  private versionService: VersionService;
  private rulesService: RulesService;
  private templateCommands: TemplateCommands;
  private configFiles = [".cursorrules", ".cursorignore"];

  constructor(private extensionContext: ExtensionContext) {
    this.templateService = new TemplateService(extensionContext.outputChannel);
    this.versionService = new VersionService(extensionContext.outputChannel);
    this.rulesService = new RulesService(extensionContext.outputChannel);
    this.templateCommands = new TemplateCommands(
      extensionContext,
      this.templateService,
      this.versionService
    );
  }

  // 获取 VSCode 扩展上下文
  getContext(): vscode.ExtensionContext | undefined {
    return this.extensionContext.context;
  }

  registerCommands() {
    const commands = [
      {
        command: "cursorify.initializeCursor",
        callback: () => this.initializeCursor(),
      },
      {
        command: "cursorify.showHistory",
        callback: () => this.showHistory(),
      },
      {
        command: "cursorify.rollback",
        callback: () => this.rollback(),
      },
      {
        command: "cursorify.showDiff",
        callback: () => this.showDiff(),
      },
      {
        command: "cursorify.updateRulesCache",
        callback: () => this.updateRulesCache(),
      },
      {
        command: "cursorify.showCache",
        callback: () => this.showCache(),
      },
      {
        command: "cursorify.clearCache",
        callback: () => this.clearCache(),
      },
      {
        command: "cursorify.searchRules",
        callback: () => this.searchRules(),
      },
      {
        command: "cursorify.saveRulesTemplate",
        callback: () => this.saveRulesTemplate(),
      },
      {
        command: "cursorify.manageRulesTemplates",
        callback: () => this.manageRulesTemplates(),
      },
      {
        command: "cursorify.manageIgnoreTemplates",
        callback: () => this.manageIgnoreTemplates(),
      },
      {
        command: "cursorify.setDefaultRulesTemplate",
        callback: () => this.setDefaultRulesTemplate(),
      },
      {
        command: "cursorify.setDefaultIgnoreTemplate",
        callback: () => this.setDefaultIgnoreTemplate(),
      },
    ];

    commands.forEach((cmd) => {
      this.extensionContext.context.subscriptions.push(
        vscode.commands.registerCommand(cmd.command, cmd.callback)
      );
    });

    // 注册文件监听器
    const watcher = vscode.workspace.createFileSystemWatcher(
      "**/{.cursorrules,.cursorignore}"
    );
    watcher.onDidChange(async (uri) => {
      const content = await vscode.workspace.fs.readFile(uri);
      const fileName = uri.path.split("/").pop() || "";
      await this.versionService.saveVersion(
        uri.fsPath.replace(fileName, ""),
        fileName,
        content.toString()
      );
    });

    this.extensionContext.context.subscriptions.push(watcher);
  }

  private async initializeCursor() {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        throw new Error("No workspace folder found");
      }

      const rootPath = workspaceFolders[0].uri.fsPath;

      // 确保内置模板已同步
      await this.templateService.syncBuiltinTemplates();

      // 初始化配置文件
      for (const file of this.configFiles) {
        await this.initializeConfigFile(rootPath, file);
      }

      vscode.window.showInformationMessage(
        "Cursor configuration initialized successfully"
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Initialization failed: ${error}`);
    }
  }

  private async initializeConfigFile(rootPath: string, file: string) {
    const filePath = vscode.Uri.file(path.join(rootPath, file));

    try {
      await vscode.workspace.fs.stat(filePath);
      // 文件已存在
      return;
    } catch {
      // 文件不存在，创建新文件
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const isRulesFile = file === ".cursorrules";

      const defaultTemplate = config.get<string>(
        isRulesFile
          ? CONFIG_DEFAULT_RULES_TEMPLATE
          : CONFIG_DEFAULT_IGNORE_TEMPLATE
      );

      const templates = isRulesFile
        ? this.templateService.getSavedRulesTemplates()
        : this.templateService.getSavedIgnoreTemplates();

      let content = "";
      if (defaultTemplate && templates[defaultTemplate]) {
        content = templates[defaultTemplate].content;
      } else {
        // 使用内置模板
        const builtinTemplate = isRulesFile
          ? templates["default-development-guide"]
          : templates["default-common-ignore"];
        content = builtinTemplate ? builtinTemplate.content : "";
      }

      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content));
      await this.versionService.saveVersion(rootPath, file, content);
    }
  }

  private async showHistory() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const historyFiles = this.versionService.getHistoryFiles(rootPath);

    if (historyFiles.length === 0) {
      vscode.window.showInformationMessage("No history found");
      return;
    }

    const items = await Promise.all(
      historyFiles.map(async (file) => {
        const stat = await vscode.workspace.fs.stat(
          vscode.Uri.file(path.join(rootPath, ".cursor-history", file))
        );
        return {
          label: file,
          description: new Date(stat.mtime).toLocaleString(),
        };
      })
    );

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a version to view",
    });

    if (selected) {
      const content = this.versionService.getVersionContent(
        rootPath,
        selected.label
      );
      const doc = await vscode.workspace.openTextDocument({
        content,
        language: "plaintext",
      });
      await vscode.window.showTextDocument(doc);
    }
  }

  private async rollback() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const historyFiles = this.versionService.getHistoryFiles(rootPath);

    if (historyFiles.length === 0) {
      vscode.window.showInformationMessage("No history found");
      return;
    }

    const items = await Promise.all(
      historyFiles.map(async (file) => {
        const stat = await vscode.workspace.fs.stat(
          vscode.Uri.file(path.join(rootPath, ".cursor-history", file))
        );
        return {
          label: file,
          description: new Date(stat.mtime).toLocaleString(),
        };
      })
    );

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a version to rollback to",
    });

    if (selected) {
      await this.versionService.rollbackToVersion(rootPath, selected.label);
      vscode.window.showInformationMessage("Rollback completed successfully");
    }
  }

  private async showDiff() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const historyFiles = this.versionService.getHistoryFiles(rootPath);

    if (historyFiles.length < 2) {
      vscode.window.showInformationMessage(
        "Need at least two versions for comparison"
      );
      return;
    }

    const items = await Promise.all(
      historyFiles.map(async (file) => {
        const stat = await vscode.workspace.fs.stat(
          vscode.Uri.file(path.join(rootPath, ".cursor-history", file))
        );
        return {
          label: file,
          description: new Date(stat.mtime).toLocaleString(),
        };
      })
    );

    const version1 = await vscode.window.showQuickPick(items, {
      placeHolder: "Select first version",
    });

    if (version1) {
      const version2 = await vscode.window.showQuickPick(
        items.filter((item) => item.label !== version1.label),
        { placeHolder: "Select second version" }
      );

      if (version2) {
        const content1 = this.versionService.getVersionContent(
          rootPath,
          version1.label
        );
        const content2 = this.versionService.getVersionContent(
          rootPath,
          version2.label
        );

        const doc1 = await vscode.workspace.openTextDocument({
          content: content1,
          language: "plaintext",
        });
        const doc2 = await vscode.workspace.openTextDocument({
          content: content2,
          language: "plaintext",
        });

        await vscode.commands.executeCommand(
          "vscode.diff",
          doc1.uri,
          doc2.uri,
          `${version1.label} ↔ ${version2.label}`
        );
      }
    }
  }

  private async updateRulesCache() {
    try {
      await this.rulesService.updateRulesCache(this.extensionContext.context);
      vscode.window.showInformationMessage("Rules cache updated successfully");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to update rules cache: ${error}`);
    }
  }

  private async showCache() {
    try {
      const cache = await this.rulesService.getRulesCache(
        this.extensionContext.context
      );
      if (!cache) {
        vscode.window.showInformationMessage("Cache is empty");
        return;
      }

      const cacheContent = {
        lastUpdate: new Date(cache.lastUpdate).toLocaleString(),
        repoPath: cache.repoPath,
      };

      const doc = await vscode.workspace.openTextDocument({
        content: JSON.stringify(cacheContent, null, 2),
        language: "json",
      });
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to show cache: ${error}`);
    }
  }

  private async clearCache() {
    try {
      await this.rulesService.clearCache(this.extensionContext.context);
      vscode.window.showInformationMessage("Cache cleared successfully");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to clear cache: ${error}`);
    }
  }

  private async searchRules() {
    try {
      const searchTerm = await vscode.window.showInputBox({
        prompt:
          'Enter search terms (e.g., "react typescript", "python django")',
        placeHolder: "Enter technologies or keywords",
      });

      if (!searchTerm) {
        return;
      }

      const matchingRules = await this.rulesService.searchRules(
        searchTerm,
        this.extensionContext.context
      );

      if (matchingRules.length === 0) {
        vscode.window.showInformationMessage("No matching rules found");
        return;
      }

      const selected = await vscode.window.showQuickPick(
        matchingRules.map((rule) => ({
          label: rule.name,
          description: rule.description,
          detail: `Tags: ${rule.tags.join(", ")}`,
          rule,
        })),
        {
          placeHolder: "Select rules to append",
          canPickMany: true,
        }
      );

      if (selected && selected.length > 0) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          vscode.window.showErrorMessage("No workspace folder found");
          return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const rulesPath = path.join(rootPath, ".cursorrules");

        let content = "";
        if (await vscode.workspace.fs.stat(vscode.Uri.file(rulesPath))) {
          const fileContent = await vscode.workspace.fs.readFile(
            vscode.Uri.file(rulesPath)
          );
          content = fileContent.toString().trim();
        }

        const newContent =
          content +
          (content ? "\n\n" : "") +
          selected
            .map(
              (item) => `# Added from: ${item.rule.name}\n${item.rule.content}`
            )
            .join("\n\n");

        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(rulesPath),
          Buffer.from(newContent)
        );
        await this.versionService.saveVersion(
          rootPath,
          ".cursorrules",
          newContent
        );

        vscode.window.showInformationMessage("Rules added successfully");
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to search rules: ${error}`);
    }
  }

  private async saveRulesTemplate() {
    await this.templateCommands.saveRulesTemplate();
  }

  private async manageRulesTemplates() {
    await this.templateCommands.manageRulesTemplates();
  }

  private async manageIgnoreTemplates() {
    await this.templateCommands.manageIgnoreTemplates();
  }

  private async setDefaultRulesTemplate() {
    await this.templateCommands.setDefaultRulesTemplate();
  }

  private async setDefaultIgnoreTemplate() {
    await this.templateCommands.setDefaultIgnoreTemplate();
  }
}
