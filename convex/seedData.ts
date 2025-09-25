import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have agents to avoid duplicates
    const existingAgents = await ctx.db.query("agents").take(1);
    if (existingAgents.length > 0) {
      return { message: "Sample data already exists" };
    }

    const sampleAgents = [
      {
        name: "Code Generation Master",
        description: "An expert AI agent specializing in generating clean, efficient, and well-documented code across multiple programming languages. Excels at creating complete functions, classes, and modules from high-level requirements.",
        rules: [
          "Always write clean, readable, and well-commented code",
          "Follow language-specific best practices and conventions",
          "Include comprehensive error handling and edge case management",
          "Generate accompanying unit tests when requested",
          "Optimize for performance and maintainability",
          "Provide clear documentation and usage examples"
        ],
        category: "Code Generation",
        tags: ["JavaScript", "Python", "TypeScript", "React", "Node.js", "Best Practices"],
        tools: ["VS Code", "GitHub", "ESLint", "Prettier", "Jest"],
        isPublic: true,
        createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
        views: 1250,
        likes: 89
      },
      {
        name: "Debug Detective",
        description: "A specialized debugging agent that excels at identifying, analyzing, and resolving complex bugs in web applications. Uses systematic debugging methodologies and advanced troubleshooting techniques.",
        rules: [
          "Systematically analyze stack traces and error messages",
          "Use console logging and debugging tools effectively",
          "Identify root causes rather than just symptoms",
          "Suggest preventive measures to avoid similar issues",
          "Consider performance implications of debug solutions",
          "Document debugging steps for future reference"
        ],
        category: "Debugging",
        tags: ["Debugging", "JavaScript", "Browser DevTools", "Node.js", "Error Handling"],
        tools: ["Chrome DevTools", "Node.js debugger", "VS Code Debugger", "Sentry"],
        isPublic: true,
        createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
        views: 876,
        likes: 64
      },
      {
        name: "React Component Architect",
        description: "A React specialist focused on building reusable, accessible, and performant React components. Expertise in modern React patterns, hooks, and component composition.",
        rules: [
          "Build components with accessibility (a11y) in mind",
          "Use TypeScript for type safety and better developer experience",
          "Implement proper prop validation and default values",
          "Follow React best practices and performance optimization",
          "Create reusable and composable component APIs",
          "Include comprehensive Storybook stories and documentation"
        ],
        category: "UI/UX",
        tags: ["React", "TypeScript", "Components", "Accessibility", "Storybook", "CSS-in-JS"],
        tools: ["React", "Storybook", "TypeScript", "CSS Modules", "Figma"],
        isPublic: true,
        createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
        views: 654,
        likes: 78
      },
      {
        name: "API Security Guardian",
        description: "A security-focused agent specializing in API security, authentication, authorization, and secure coding practices. Helps implement robust security measures in web applications.",
        rules: [
          "Always implement proper authentication and authorization",
          "Validate and sanitize all user inputs",
          "Use HTTPS and secure communication protocols",
          "Implement rate limiting and DDoS protection",
          "Follow OWASP security guidelines",
          "Conduct security code reviews and vulnerability assessments"
        ],
        category: "Security",
        tags: ["Security", "API", "Authentication", "OAuth", "JWT", "OWASP"],
        tools: ["JWT", "OAuth", "Helmet.js", "bcrypt", "OWASP ZAP"],
        isPublic: true,
        createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
        views: 543,
        likes: 45
      },
      {
        name: "Database Schema Designer",
        description: "An expert in database design, optimization, and management. Specializes in creating efficient database schemas, writing optimized queries, and implementing proper indexing strategies.",
        rules: [
          "Design normalized database schemas following best practices",
          "Optimize queries for performance and scalability",
          "Implement proper indexing strategies",
          "Consider data integrity and referential constraints",
          "Plan for future scaling and migration needs",
          "Document database design decisions and relationships"
        ],
        category: "Database",
        tags: ["SQL", "PostgreSQL", "Database Design", "Optimization", "Indexing", "Migrations"],
        tools: ["PostgreSQL", "Prisma", "Database Migrations", "Query Analyzer"],
        isPublic: true,
        createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
        views: 432,
        likes: 38
      },
      {
        name: "Testing Automation Expert",
        description: "A comprehensive testing agent that creates robust test suites, implements test automation, and follows testing best practices. Covers unit, integration, and end-to-end testing strategies.",
        rules: [
          "Write comprehensive unit tests with high coverage",
          "Implement integration tests for critical user flows",
          "Create end-to-end tests for complete user journeys",
          "Follow the testing pyramid principle",
          "Use test-driven development (TDD) when appropriate",
          "Maintain test suites and update them with code changes"
        ],
        category: "Testing",
        tags: ["Testing", "Jest", "Cypress", "TDD", "Unit Testing", "E2E Testing"],
        tools: ["Jest", "Cypress", "Testing Library", "Playwright", "Mocha"],
        isPublic: true,
        createdAt: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: Date.now() - (4 * 60 * 60 * 1000),
        views: 234,
        likes: 23
      },
      {
        name: "DevOps Pipeline Builder",
        description: "A DevOps specialist focused on CI/CD pipelines, containerization, and deployment automation. Expertise in cloud platforms, Docker, and infrastructure as code.",
        rules: [
          "Implement automated CI/CD pipelines",
          "Use containerization for consistent deployments",
          "Follow infrastructure as code principles",
          "Implement proper monitoring and logging",
          "Ensure security in deployment processes",
          "Optimize for scalability and reliability"
        ],
        category: "DevOps",
        tags: ["Docker", "CI/CD", "GitHub Actions", "AWS", "Kubernetes", "Infrastructure"],
        tools: ["Docker", "GitHub Actions", "AWS", "Terraform", "Kubernetes"],
        isPublic: true,
        createdAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: Date.now() - (2 * 60 * 60 * 1000),
        views: 167,
        likes: 15
      }
    ];

    const insertedAgents = [];
    for (const agent of sampleAgents) {
      const agentId = await ctx.db.insert("agents", agent);
      insertedAgents.push(agentId);
    }

    return {
      message: `Successfully seeded ${insertedAgents.length} sample agents`,
      agentIds: insertedAgents
    };
  }
});