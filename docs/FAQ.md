# Frequently Asked Questions (FAQ)

## General Questions

### What is Cursorify?

Cursorify is a VSCode extension that helps you manage Cursor AI configuration files (`.cursorrules` and `.cursorignore`) with version control, templates, and rule management features.

### Why do I need Cursorify?

If you're using Cursor AI, Cursorify helps you:

- Maintain consistent development rules across projects
- Keep track of changes to your configuration
- Share and reuse configuration templates
- Easily search and apply community rules

## Installation & Setup

### How do I install Cursorify?

You can install Cursorify in two ways:

1. Through VS Code Marketplace
2. By downloading and installing the VSIX file manually

### Why can't I see the commands in VS Code?

Make sure:

1. The extension is installed and enabled
2. You're in a workspace (folder)
3. You have the required dependencies (Git)

## Features & Usage

### How does version control work?

- Every change to your configuration files is automatically versioned
- Versions are stored in the `.cursor-history` directory
- You can view, compare, and rollback to previous versions
- The number of versions kept is configurable

### How do templates work?

- You can save any configuration as a template
- Templates can be managed and reused across projects
- Built-in templates provide good starting points
- You can set default templates for new projects

### How do I search for rules?

1. Open the command palette
2. Run "Cursorify: Search Rules"
3. Enter keywords related to your technology/needs
4. Preview and select rules to apply

## Troubleshooting

### The extension is not working

Common solutions:

1. Reload VS Code
2. Check the output panel for errors
3. Ensure Git is installed and accessible
4. Check your internet connection for rules search

### I lost my configuration

You can:

1. Check the `.cursor-history` directory
2. Use "Show History" to view previous versions
3. Use "Rollback" to restore a previous version

### Rules search is not working

Make sure:

1. You have an internet connection
2. The rules cache is up to date
3. Try updating the cache manually

## Contributing

### How can I contribute?

You can:

1. Report bugs
2. Suggest features
3. Submit pull requests
4. Share your templates
5. Help with documentation

### How do I report a bug?

When reporting bugs:

1. Check existing issues first
2. Include your VS Code version
3. Describe the steps to reproduce
4. Include relevant error messages
5. Attach configuration files if possible

## Contact & Support

### How do I get help?

1. Check this FAQ
2. Search existing issues
3. Open a new issue
4. Contact support at [support@email.com]

### Where can I find updates?

1. Follow the GitHub repository
2. Check the CHANGELOG.md file
3. Watch for VS Code extension updates
