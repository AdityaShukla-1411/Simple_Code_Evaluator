import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

class CodeEvaluator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async evaluateCode(codeContent, language = "unknown") {
    try {
      const prompt = this.buildEvaluationPrompt(codeContent, language);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        evaluation: text,
        metadata: {
          codeLength: codeContent.length,
          language: language,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error generating evaluation:", error);
      return {
        success: false,
        error: error.message,
        evaluation: null,
      };
    }
  }

  buildEvaluationPrompt(codeContent, language) {
    return `
You are an expert code evaluator. Analyze the following ${language} code and provide a comprehensive evaluation with scores.

CODE TO EVALUATE:
\`\`\`${language}
${codeContent}
\`\`\`

Please provide your evaluation in the following EXACT format:

# 🔍 Code Evaluation Report

## 📊 Score Summary
**Overall Score: X/100**

### Detailed Breakdown:
| Criteria | Score | Max | Grade |
|----------|-------|-----|-------|
| 📝 Code Quality | X/20 | 20 | A/B/C/D/F |
| ⚡ Algorithm Efficiency | X/20 | 20 | A/B/C/D/F |
| ✅ Best Practices | X/20 | 20 | A/B/C/D/F |
| 🛡️ Error Handling | X/15 | 15 | A/B/C/D/F |
| 📚 Documentation | X/15 | 15 | A/B/C/D/F |
| 🔧 Maintainability | X/10 | 10 | A/B/C/D/F |

**Final Grade: [A+/A/B+/B/C+/C/D/F]**

---

## ✅ Strengths
- **[Category]**: Brief description
- **[Category]**: Brief description
- **[Category]**: Brief description

## 🔄 Areas for Improvement  
- **[Category]**: Specific issue and why it matters
- **[Category]**: Specific issue and why it matters
- **[Category]**: Specific issue and why it matters

## 💡 Recommendations
### High Priority:
1. **[Action]**: Detailed explanation with code example if applicable
2. **[Action]**: Detailed explanation with code example if applicable

### Medium Priority:
1. **[Action]**: Brief explanation
2. **[Action]**: Brief explanation

### Low Priority:
1. **[Action]**: Brief explanation

---

## 📈 Performance Analysis
- **Time Complexity**: O(?)
- **Space Complexity**: O(?)
- **Scalability**: [Excellent/Good/Fair/Poor]

## 🎯 Summary
Brief 2-3 sentence summary of the code's overall quality and main takeaways.

Keep your feedback constructive, specific, and actionable. Use concrete examples when possible.
`;
  }
}

export default CodeEvaluator;
