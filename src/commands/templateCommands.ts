import * as vscode from "vscode";
import * as path from "path";
import { ExtensionContext } from "../models/types";
import { TemplateService } from "../services/templateService";
import { VersionService } from "../services/versionService";
import {
  CONFIG_SECTION,
  CONFIG_DEFAULT_RULES_TEMPLATE,
  CONFIG_DEFAULT_IGNORE_TEMPLATE,
} from "../constants";

export class TemplateCommands {
  constructor(
    private extensionContext: ExtensionContext,
    private templateService: TemplateService,
    private versionService: VersionService
  ) {}

  async saveRulesTemplate() {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      // 让用户选择要保存的配置文件
      const fileToSave = await vscode.window.showQuickPick(
        [
          {
            label: ".cursorrules",
            description: "Save cursor rules configuration as template",
          },
          {
            label: ".cursorignore",
            description: "Save cursor ignore patterns as template",
          },
        ],
        {
          placeHolder: "Select which configuration to save as template",
        }
      );

      if (!fileToSave) return;

      const filePath = path.join(
        workspaceFolders[0].uri.fsPath,
        fileToSave.label
      );

      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
      } catch {
        vscode.window.showErrorMessage(`No ${fileToSave.label} file found`);
        return;
      }

      // 获取当前配置内容
      const fileContent = await vscode.workspace.fs.readFile(
        vscode.Uri.file(filePath)
      );
      const content = fileContent.toString();

      // 获取模板名称
      const name = await vscode.window.showInputBox({
        prompt: `Enter a name for this ${fileToSave.label} template`,
        placeHolder:
          fileToSave.label === ".cursorrules"
            ? "e.g., my-typescript-react-rules"
            : "e.g., node-project-ignore",
        validateInput: (value) => {
          if (!value) return "Name is required";
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return "Name can only contain letters, numbers, hyphens and underscores";
          }
          return null;
        },
      });

      if (!name) return;

      // 获取描述
      const description = await vscode.window.showInputBox({
        prompt: "Enter a description for this template",
        placeHolder:
          fileToSave.label === ".cursorrules"
            ? "e.g., TypeScript React project rules configuration"
            : "e.g., Node.js project ignore patterns",
      });

      if (!description) return;

      // 保存模板
      await this.templateService.saveTemplate(
        {
          name,
          description,
          content,
          createdAt: Date.now(),
        },
        fileToSave.label === ".cursorrules"
      );

      // 询问是否设为默认模板
      const setAsDefault = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Set this template as default?",
      });

      if (setAsDefault === "Yes") {
        const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
        await config.update(
          fileToSave.label === ".cursorrules"
            ? CONFIG_DEFAULT_RULES_TEMPLATE
            : CONFIG_DEFAULT_IGNORE_TEMPLATE,
          name,
          true
        );
      }

      vscode.window.showInformationMessage(
        `${fileToSave.label} template "${name}" saved successfully`
      );
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save template: ${error}`);
    }
  }

  async manageRulesTemplates() {
    try {
      const templates = this.templateService.getSavedRulesTemplates();
      await this.manageTemplates(templates, true);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to manage rules templates: ${error}`
      );
    }
  }

  async manageIgnoreTemplates() {
    try {
      const templates = this.templateService.getSavedIgnoreTemplates();
      await this.manageTemplates(templates, false);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to manage ignore templates: ${error}`
      );
    }
  }

  private async manageTemplates(
    templates: Record<string, any>,
    isRulesTemplate: boolean
  ) {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const defaultTemplate = config.get<string>(
      isRulesTemplate
        ? CONFIG_DEFAULT_RULES_TEMPLATE
        : CONFIG_DEFAULT_IGNORE_TEMPLATE
    );

    if (Object.keys(templates).length === 0) {
      vscode.window.showInformationMessage("No saved templates found");
      return;
    }

    const items = Object.values(templates).map((template) => ({
      label:
        template.name + (template.name === defaultTemplate ? " (Default)" : ""),
      description: template.description,
      detail: `Created: ${new Date(template.createdAt).toLocaleString()}`,
      template,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a template to manage",
    });

    if (!selected) return;

    const action = await vscode.window.showQuickPick(
      ["View Content", "Set as Default", "Delete", "Apply to Current Project"],
      {
        placeHolder: `Select action for "${selected.template.name}"`,
      }
    );

    switch (action) {
      case "View Content":
        const doc = await vscode.workspace.openTextDocument({
          content: selected.template.content,
          language: "plaintext",
        });
        await vscode.window.showTextDocument(doc);
        break;

      case "Set as Default":
        await config.update(
          isRulesTemplate
            ? CONFIG_DEFAULT_RULES_TEMPLATE
            : CONFIG_DEFAULT_IGNORE_TEMPLATE,
          selected.template.name,
          true
        );
        vscode.window.showInformationMessage(
          `Set "${selected.template.name}" as default template`
        );
        break;

      case "Delete":
        const confirm = await vscode.window.showQuickPick(["Yes", "No"], {
          placeHolder: `Are you sure you want to delete "${selected.template.name}"?`,
        });

        if (confirm === "Yes") {
          await this.templateService.deleteTemplate(
            selected.template.name,
            isRulesTemplate
          );

          // 如果删除的是默认模板，清除默认模板设置
          if (selected.template.name === defaultTemplate) {
            await config.update(
              isRulesTemplate
                ? CONFIG_DEFAULT_RULES_TEMPLATE
                : CONFIG_DEFAULT_IGNORE_TEMPLATE,
              "",
              true
            );
          }

          vscode.window.showInformationMessage(
            `Template "${selected.template.name}" deleted`
          );
        }
        break;

      case "Apply to Current Project":
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          vscode.window.showErrorMessage("No workspace folder found");
          return;
        }

        const fileName = isRulesTemplate ? ".cursorrules" : ".cursorignore";
        const filePath = path.join(workspaceFolders[0].uri.fsPath, fileName);

        // 保存当前内容作为备份
        try {
          const currentContent = await vscode.workspace.fs.readFile(
            vscode.Uri.file(filePath)
          );
          await this.versionService.saveVersion(
            workspaceFolders[0].uri.fsPath,
            fileName,
            currentContent.toString()
          );
        } catch {
          // 文件不存在，不需要备份
        }

        // 写入模板内容
        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(filePath),
          Buffer.from(selected.template.content)
        );
        vscode.window.showInformationMessage(
          `Applied template "${selected.template.name}" to current project`
        );
        break;
    }
  }

  async setDefaultRulesTemplate() {
    await this.setDefaultTemplate(true);
  }

  async setDefaultIgnoreTemplate() {
    await this.setDefaultTemplate(false);
  }

  private async setDefaultTemplate(isRulesTemplate: boolean) {
    try {
      const templates = isRulesTemplate
        ? this.templateService.getSavedRulesTemplates()
        : this.templateService.getSavedIgnoreTemplates();

      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const currentDefault = config.get<string>(
        isRulesTemplate
          ? CONFIG_DEFAULT_RULES_TEMPLATE
          : CONFIG_DEFAULT_IGNORE_TEMPLATE
      );

      if (Object.keys(templates).length === 0) {
        vscode.window.showInformationMessage(
          "No saved templates found. Save a template first."
        );
        return;
      }

      const items = [
        {
          label: "None",
          description: "No default template",
          detail: currentDefault === "" ? "Currently selected" : undefined,
        },
        ...Object.values(templates).map((template) => ({
          label: template.name,
          description: template.description,
          detail:
            template.name === currentDefault ? "Currently selected" : undefined,
        })),
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select default template",
      });

      if (selected) {
        const newDefault = selected.label === "None" ? "" : selected.label;
        await config.update(
          isRulesTemplate
            ? CONFIG_DEFAULT_RULES_TEMPLATE
            : CONFIG_DEFAULT_IGNORE_TEMPLATE,
          newDefault,
          true
        );
        vscode.window.showInformationMessage(
          newDefault
            ? `Set "${newDefault}" as default template`
            : "Cleared default template"
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to set default template: ${error}`
      );
    }
  }
}
