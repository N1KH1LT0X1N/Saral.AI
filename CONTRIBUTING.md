# Contributing to SARAL AI

Thank you for your interest in contributing to SARAL AI! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Contributions](#making-contributions)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive, and harassment-free environment. Be respectful, constructive, and collaborative.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Python 3.11+ installed
- Node.js 16+ and npm 8+ installed
- Git configured with your GitHub account
- API keys for testing (see [README.md](README.md))

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GGW_Megathon_Saral.git
   cd GGW_Megathon_Saral
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/N1KH1LT0X1N/GGW_Megathon_Saral.git
   ```

---

## Development Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file with your API keys
cp .env.example .env  # Edit with your keys

# Run server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Run development server
npm start
```

### Chrome Extension

1. Make changes in `arxiv-plugin/`
2. Load unpacked extension in Chrome
3. Test on supported paper sites

---

## Making Contributions

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 **Bug Fixes** | Fix existing issues |
| ✨ **Features** | Add new functionality |
| 📚 **Documentation** | Improve docs and comments |
| 🎨 **UI/UX** | Improve user interface |
| ⚡ **Performance** | Optimize code performance |
| 🧪 **Tests** | Add or improve tests |
| 🔧 **Refactoring** | Code quality improvements |

### Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following code style guidelines

3. **Test your changes:**
   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && npm test
   ```

4. **Commit your changes** (see commit guidelines)

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

---

## Code Style

### Python (Backend)

- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use type hints for function parameters and returns
- Maximum line length: 100 characters
- Use descriptive variable names

```python
# Good example
def generate_script(
    paper_content: str,
    complexity_level: str = "medium"
) -> Dict[str, str]:
    """
    Generate presentation script from paper content.
    
    Args:
        paper_content: Full text of the paper
        complexity_level: One of 'easy', 'medium', 'advanced'
    
    Returns:
        Dictionary mapping section names to scripts
    """
    pass
```

### JavaScript/React (Frontend)

- Use functional components with hooks
- Use destructuring for props
- Use meaningful component and variable names
- Keep components focused and reusable

```jsx
// Good example
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="feature-card">
      <Icon className="feature-icon" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Extract repeated patterns into components
- Use semantic class names for custom CSS

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(backend): add podcast complexity level support
fix(frontend): resolve audio player memory leak
docs(readme): update installation instructions
style(backend): format code with black
refactor(services): extract TTS logic to separate module
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with main

### PR Template

When opening a PR, include:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe)

## Testing
Describe how you tested the changes.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Fixes #123
```

### Review Process

1. Automated checks run on PR
2. Maintainer reviews code
3. Address feedback if requested
4. Maintainer approves and merges

---

## Reporting Issues

### Bug Reports

When reporting bugs, include:

1. **Description:** Clear description of the bug
2. **Steps to Reproduce:** How to trigger the bug
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Environment:** OS, Python version, browser, etc.
6. **Error Logs:** Console output or error messages
7. **Screenshots:** If applicable

### Feature Requests

When requesting features, include:

1. **Use Case:** Why you need this feature
2. **Proposed Solution:** How it could work
3. **Alternatives Considered:** Other options you thought of
4. **Additional Context:** Any other relevant information

---

## Project Structure

Understanding the codebase:

```
GGW_Megathon_Saral/
├── backend/                 # FastAPI server
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── models/         # Data models
│   └── requirements.txt
├── frontend/               # React application
│   └── src/
│       ├── pages/          # Page components
│       ├── components/     # Reusable components
│       └── contexts/       # State management
├── arxiv-plugin/           # Chrome extension
└── docs/                   # Documentation
```

---

## Getting Help

- **Discord/Slack:** Coming soon
- **GitHub Discussions:** Ask questions
- **Email:** democratise.research@gmail.com

---

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to making research accessible to everyone! 🎓
