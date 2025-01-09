# Cursorify

![Cursorify](resources/icon.png)

VSCode extension for managing Cursor AI configuration files with version control.

## Features

- Initialize and manage `.cursorrules` and `.cursorignore` files
- Version control for configuration files (keeps last N versions)
- Template management with default template support
- Built-in default templates for development guide and common ignore patterns
- Search and apply rules from awesome-cursorrules repository
- Automatic version backup on file changes

## Requirements

- VSCode 1.84.0 or higher
- Git (for rules repository management)
- Node.js & npm (for development)

## Installation

1. From VS Code Marketplace:

   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Cursorify"
   - Click Install

2. From VSIX file:
   - Download the .vsix file from the latest release
   - Run `code --install-extension cursorify-x.x.x.vsix`

## Commands

All commands can be accessed through the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

### Core Commands

- `Cursorify: Initialize Cursor Configuration`

  - Creates initial `.cursorrules` and `.cursorignore` files
  - Uses default template if set, otherwise creates basic structure
  - Automatically creates `.cursor-history` directory for version control

- `Cursorify: Search Rules`
  - Search for rules based on technology/keywords
  - Preview rule content before applying
  - Append selected rules to existing configuration

### Template Management

- `Cursorify: Save Current Rules as Template`

  - Save current `.cursorrules` or `.cursorignore` as a reusable template
  - Add name and description for easy identification
  - Option to set as default template

- `Cursorify: Manage Rules Templates`

  - View all saved rules templates
  - View template content
  - Set/change default template
  - Delete templates
  - Apply template to current project

- `Cursorify: Manage Ignore Templates`

  - View all saved ignore templates
  - View template content
  - Set/change default template
  - Delete templates
  - Apply template to current project

- `Cursorify: Set Default Rules Template`

  - Quick access to set/change default rules template
  - Option to clear default template

- `Cursorify: Set Default Ignore Template`
  - Quick access to set/change default ignore template
  - Option to clear default template

### Version Control

- `Cursorify: Show Configuration History`

  - View version history of configuration files
  - Each version includes timestamp and version number (v1, v2, etc.)

- `Cursorify: Rollback Configuration`

  - Restore to a previous version
  - Automatically creates backup of current version

- `Cursorify: Show Configuration Diff`
  - Compare different versions of configuration
  - Visual diff view for easy comparison

### Cache Management

- `Cursorify: Update Rules Cache`

  - Update local cache of rules repository
  - Shows progress during update

- `Cursorify: Show Cache Content`

  - View current cache status
  - Shows cache location and last update time

- `Cursorify: Clear Cache`
  - Clear local rules cache
  - Useful for troubleshooting

## Configuration

Available settings in VSCode preferences:

- `cursorify.maxVersions`: Maximum number of versions to keep in history (default: 10)
- `cursorify.defaultRulesTemplate`: Default template for new rules configurations
- `cursorify.defaultIgnoreTemplate`: Default template for new ignore configurations
- `cursorify.savedRulesTemplates`: Storage for user-saved rules templates
- `cursorify.savedIgnoreTemplates`: Storage for user-saved ignore templates
- `cursorify.rulesCache`: Cache settings for rules repository

## Usage Examples

1. Initial Setup:

   ```
   1. Open your project in VSCode
   2. Run "Cursorify: Initialize Cursor Configuration"
      - Uses built-in default templates if no user defaults are set
      - Creates both .cursorrules and .cursorignore files
   3. Optionally search for additional rules using "Cursorify: Search Rules"
   ```

2. Managing Templates:

   ```
   For Rules Templates:
   1. Customize your .cursorrules file
   2. Run "Cursorify: Save Current Rules as Template"
   3. Enter template name and description
   4. Optionally set as default rules template

   For Ignore Templates:
   1. Customize your .cursorignore file
   2. Run "Cursorify: Save Current Rules as Template"
   3. Choose .cursorignore when prompted
   4. Enter template name and description
   5. Optionally set as default ignore template
   ```

3. Version Control:

   ```
   1. Changes to .cursorrules or .cursorignore are automatically versioned
   2. Use "Show History" to view versions
   3. Use "Rollback" to restore previous versions
   4. Use "Show Diff" to compare versions
   ```

4. Adding Rules:
   ```
   1. Run "Cursorify: Search Rules"
   2. Enter technology keywords
   3. Preview and select rules to apply
   4. Rules are appended to existing configuration
   ```

## File Structure

```
your-project/
├── .cursorrules           # Main rules configuration
├── .cursorignore         # Ignore patterns
└── .cursor-history/      # Version history
    ├── cursorrules_v1_[timestamp]
    ├── cursorrules_v2_[timestamp]
    └── cursorignore_v1_[timestamp]
```

## Technical Stack

- TypeScript
- VSCode Extension API
- Node.js File System API
- simple-git for Git operations
- node-fetch for API calls

## Project Structure

```
src/
├── commands/            # Command implementations
│   ├── index.ts        # Main command handler
│   └── templateCommands.ts # Template-related commands
├── constants/          # Constants and configurations
│   └── index.ts
├── models/            # Type definitions
│   └── types.ts
├── services/          # Business logic
│   ├── templateService.ts
│   ├── versionService.ts
│   └── rulesService.ts
└── extension.ts       # Extension entry point
```

## Development

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/cursorify.git
   cd cursorify
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Open in VS Code:

   ```bash
   code .
   ```

4. Run/Debug:
   - Press F5 to start debugging
   - Use `npm run watch` for development
   - Use `npm run test` for testing

## Building

```bash
npm run compile
npm run package
```

The VSIX file will be generated in the root directory.

## Dependencies

- VSCode ^1.84.0
- simple-git ^3.27.0
- node-fetch ^2.7.0

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Support

If you encounter any problems or have suggestions:

1. Check the [FAQ](docs/FAQ.md)
2. Open an issue

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for all changes.

## Authors

- iAladdin - Initial work - [iAladdin](https://github.com/iAladdin)

## Acknowledgments

- Thanks to [PatrickJS](https://github.com/PatrickJS) for the awesome-cursorrules repository
- VSCode Extension API documentation and examples
- All contributors who have helped with the project
