import * as vscode from "vscode";

export interface RuleTemplate {
  name: string;
  description: string;
  content: string;
  tags: string[];
}

export interface RulesCache {
  lastUpdate: number;
  repoPath: string;
}

export interface GitHubFile {
  name: string;
  type: string;
  url: string;
  download_url: string;
}

export interface SavedTemplate {
  name: string;
  description: string;
  content: string;
  createdAt: number;
}

export interface ExtensionContext {
  outputChannel: vscode.OutputChannel;
  context: vscode.ExtensionContext;
}
