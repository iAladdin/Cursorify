export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const CONFIG_SECTION = "cursorify";
export const CONFIG_DEFAULT_RULES_TEMPLATE = "defaultRulesTemplate";
export const CONFIG_DEFAULT_IGNORE_TEMPLATE = "defaultIgnoreTemplate";
export const CONFIG_SAVED_RULES_TEMPLATES = "savedRulesTemplates";
export const CONFIG_SAVED_IGNORE_TEMPLATES = "savedIgnoreTemplates";
export const BUILTIN_RULES_TEMPLATE_NAME = "default-development-guide";
export const BUILTIN_IGNORE_TEMPLATE_NAME = "default-common-ignore";

// 内置模板内容
export const BUILTIN_TEMPLATES = {
  RULES: `# Development Guide

## Development Process

### Task Management Process

When handling each new task, you should:

1. Review Scratchpad content to understand the current context
2. Clean up old task-related content (if needed)
3. Explain the task's objectives and scope
4. Plan specific task steps
5. Use markers to track progress: [X] for completed, [ ] for todo
6. Reflect and plan at milestones
7. Update cursorrules when gaining important insights

### Lessons Learned

#### User-Specified Experience

#### Cursor AI Accumulated Experience

### Scratchpad
Use this space for temporary notes and task planning.


## Project Standards

### File Organization
- Follow consistent directory structure
- Group related files together
- Keep clear separation of concerns

### Code Style
- Use consistent naming conventions
- Follow language-specific best practices
- Maintain clear documentation

### Error Handling
- Implement proper error handling
- Use appropriate error types
- Provide meaningful error messages

### Testing
- Write comprehensive tests
- Follow test-driven development when appropriate
- Maintain good test coverage


## Technical Specifications

### Architecture
- Document system architecture
- Define component interactions
- Maintain clear boundaries

### Performance
- Consider performance implications
- Implement optimizations where needed
- Monitor and measure performance

### Security
- Follow security best practices
- Handle sensitive data appropriately
- Implement proper authentication/authorization


## Version Dependencies
- Document all major dependencies
- Specify version requirements
- Track dependency updates`,

  IGNORE: `# Cursor Ignore Configuration
# Common patterns to ignore

# Version Control
.git/
.svn/
.hg/

# Build outputs
build/
dist/
out/
target/
*.exe
*.dll
*.so
*.dylib

# Dependencies
node_modules/
vendor/
.venv/
venv/
env/
__pycache__/
*.pyc

# IDE and Editor files
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Logs and databases
*.log
logs/
log/
*.sqlite
*.db

# Cache and temporary files
.cache/
.temp/
tmp/
temp/
.cursor-history/

# Test coverage
coverage/
.coverage
htmlcov/

# Environment and secrets
.env
.env.local
*.pem
*.key
secrets/

# Documentation build
docs/_build/
site/

# Package files
*.tgz
*.tar.gz
*.zip
*.rar

# Mobile development
.gradle/
*.apk
*.ipa

# Project specific
# Add your project-specific ignore patterns here`,
};
