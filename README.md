# Simple Code Evaluator

A minimal, clean code evaluation tool that takes code files as input and generates AI-powered evaluation reports with scores.

## Features

- 📁 **File Upload**: Upload code files directly
- ⚡ **Direct Input**: Paste code for instant evaluation
- 🤖 **AI-Powered**: Uses Google Gemini AI for intelligent analysis
- 📊 **Detailed Scores**: Get comprehensive ratings across multiple criteria
- 📋 **Report Management**: View and manage all evaluation reports
- 🎯 **Multi-Language**: Supports JavaScript, Python, Java, C++, and more

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:4000
   ```

## API Endpoints

- `POST /evaluate` - Evaluate code directly
- `POST /upload` - Upload file and get evaluation
- `GET /reports` - List all reports
- `GET /report/:id` - Get specific report

## Evaluation Criteria

Each code submission is evaluated on:

- **Code Quality** (20 points): Readability, structure, naming
- **Algorithm Efficiency** (20 points): Time/space complexity
- **Best Practices** (20 points): Language conventions, patterns
- **Error Handling** (15 points): Robustness, edge cases
- **Documentation** (15 points): Comments, clarity
- **Maintainability** (10 points): Modularity, extensibility

**Total Score: 100 points**

## Supported Languages

- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Python (.py)
- Java (.java)
- C++ (.cpp)
- C (.c)
- PHP (.php)
- Ruby (.rb)
- Go (.go)
- Rust (.rs)

## Usage Examples

### Upload File

```bash
curl -X POST -F "file=@mycode.js" http://localhost:4000/upload
```

### Evaluate Code Directly

```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"code":"console.log(\"Hello World\");","language":"javascript"}' \
     http://localhost:4000/evaluate
```

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Server port (default: 4000)

## License

MIT
