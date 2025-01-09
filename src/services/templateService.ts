import * as vscode from "vscode";
import { SavedTemplate } from "../models/types";
import {
  CONFIG_SECTION,
  CONFIG_SAVED_RULES_TEMPLATES,
  CONFIG_SAVED_IGNORE_TEMPLATES,
  BUILTIN_RULES_TEMPLATE_NAME,
  BUILTIN_IGNORE_TEMPLATE_NAME,
  BUILTIN_TEMPLATES,
} from "../constants";

export class TemplateService {
  constructor(private outputChannel: vscode.OutputChannel) {}

  // 同步内置模板
  async syncBuiltinTemplates(): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

    // 同步规则模板
    const savedRulesTemplates =
      config.get<Record<string, SavedTemplate>>(CONFIG_SAVED_RULES_TEMPLATES) ||
      {};
    savedRulesTemplates[BUILTIN_RULES_TEMPLATE_NAME] = {
      name: BUILTIN_RULES_TEMPLATE_NAME,
      description:
        "Default development guide template with comprehensive project management and technical specifications",
      content: BUILTIN_TEMPLATES.RULES,
      createdAt:
        savedRulesTemplates[BUILTIN_RULES_TEMPLATE_NAME]?.createdAt ||
        Date.now(),
    };
    await config.update(
      CONFIG_SAVED_RULES_TEMPLATES,
      savedRulesTemplates,
      true
    );

    // 同步忽略模板
    const savedIgnoreTemplates =
      config.get<Record<string, SavedTemplate>>(
        CONFIG_SAVED_IGNORE_TEMPLATES
      ) || {};
    savedIgnoreTemplates[BUILTIN_IGNORE_TEMPLATE_NAME] = {
      name: BUILTIN_IGNORE_TEMPLATE_NAME,
      description:
        "Default ignore template with common patterns for various development environments",
      content: BUILTIN_TEMPLATES.IGNORE,
      createdAt:
        savedIgnoreTemplates[BUILTIN_IGNORE_TEMPLATE_NAME]?.createdAt ||
        Date.now(),
    };
    await config.update(
      CONFIG_SAVED_IGNORE_TEMPLATES,
      savedIgnoreTemplates,
      true
    );

    this.outputChannel.appendLine("Builtin templates synced successfully");
  }

  // 获取保存的规则模板
  getSavedRulesTemplates(): Record<string, SavedTemplate> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return (
      config.get<Record<string, SavedTemplate>>(CONFIG_SAVED_RULES_TEMPLATES) ||
      {}
    );
  }

  // 获取保存的忽略模板
  getSavedIgnoreTemplates(): Record<string, SavedTemplate> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return (
      config.get<Record<string, SavedTemplate>>(
        CONFIG_SAVED_IGNORE_TEMPLATES
      ) || {}
    );
  }

  // 保存模板
  async saveTemplate(
    template: SavedTemplate,
    isRulesTemplate: boolean
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const configKey = isRulesTemplate
      ? CONFIG_SAVED_RULES_TEMPLATES
      : CONFIG_SAVED_IGNORE_TEMPLATES;
    const savedTemplates =
      config.get<Record<string, SavedTemplate>>(configKey) || {};

    savedTemplates[template.name] = template;
    await config.update(configKey, savedTemplates, true);
  }

  // 删除模板
  async deleteTemplate(
    templateName: string,
    isRulesTemplate: boolean
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const configKey = isRulesTemplate
      ? CONFIG_SAVED_RULES_TEMPLATES
      : CONFIG_SAVED_IGNORE_TEMPLATES;
    const savedTemplates =
      config.get<Record<string, SavedTemplate>>(configKey) || {};

    delete savedTemplates[templateName];
    await config.update(configKey, savedTemplates, true);
  }
}
