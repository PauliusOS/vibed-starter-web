import { internalMutation } from "./_generated/server";

export const seedAgents = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Sample agents data
    const sampleAgents = [
      {
        name: "React Component Generator",
        description: "An AI agent specialized in generating modern React components using TypeScript, hooks, and best practices. It creates functional components with proper prop types, handles state management, and follows React design patterns.",
        rules: [
          "Always use TypeScript for type safety and better developer experience",
          "Prefer functional components with hooks over class components",
          "Use proper prop validation with TypeScript interfaces",
          "Implement responsive design with Tailwind CSS or styled-components",
          "Follow React hooks rules of usage",
          "Use React.memo for performance optimization when necessary",
          "Implement proper error boundaries for robust error handling"
        ],
        category: "Code Generation",
        tags: ["React", "TypeScript", "JavaScript", "Hooks", "Components"],
        tools: ["VS Code", "ESLint", "Prettier", "Vite"],
        isPublic: true,
        createdAt: Date.now() - 86400000 * 7, // 7 days ago
        updatedAt: Date.now() - 86400000 * 3,
        views: 234,
        likes: 45,
      },
      {
        name: "Python Debug Assistant",
        description: "Expert debugging agent for Python applications. Specializes in identifying bugs, performance bottlenecks, and providing solutions with detailed explanations. Covers web frameworks, data processing, and general Python development.",
        rules: [
          "Always provide step-by-step debugging approach",
          "Use proper Python debugging tools like pdb, logging, and profiling",
          "Identify common Python pitfalls and anti-patterns",
          "Suggest performance improvements and optimizations",
          "Provide unit test cases to prevent future bugs",
          "Use type hints for better code documentation",
          "Follow PEP 8 style guidelines"
        ],
        category: "Debugging",
        tags: ["Python", "Debugging", "Flask", "Django", "FastAPI"],
        tools: ["PyCharm", "pdb", "pytest", "Black", "mypy"],
        isPublic: true,
        createdAt: Date.now() - 86400000 * 14, // 14 days ago
        updatedAt: Date.now() - 86400000 * 5,
        views: 189,
        likes: 32,
      },
      {
        name: "Code Refactoring Expert",
        description: "Specialized in improving code quality through refactoring. Focuses on clean code principles, SOLID design patterns, and reducing technical debt while maintaining functionality.",
        rules: [
          "Follow SOLID principles for better code architecture",
          "Extract reusable functions and components",
          "Eliminate code duplication (DRY principle)",
          "Improve variable and function naming for clarity",
          "Reduce cyclomatic complexity of functions",
          "Implement proper error handling and validation",
          "Add comprehensive documentation and comments"
        ],
        category: "Refactoring",
        tags: ["Clean Code", "SOLID", "Design Patterns", "Architecture"],
        tools: ["SonarQube", "ESLint", "Pylint", "RuboCop"],
        isPublic: true,
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000 * 2,
        views: 156,
        likes: 28,
      },
      {
        name: "API Testing Specialist",
        description: "Comprehensive API testing agent that creates automated test suites, validates endpoints, and ensures API reliability. Covers REST, GraphQL, and gRPC testing strategies.",
        rules: [
          "Create comprehensive test coverage for all endpoints",
          "Implement proper authentication and authorization testing",
          "Test edge cases and error scenarios",
          "Validate request/response schemas",
          "Implement performance and load testing",
          "Use proper assertion libraries and test frameworks",
          "Generate detailed test reports and documentation"
        ],
        category: "Testing",
        tags: ["API", "Testing", "REST", "GraphQL", "Automation"],
        tools: ["Postman", "Jest", "Cypress", "Artillery", "Newman"],
        isPublic: true,
        createdAt: Date.now() - 86400000 * 5,
        updatedAt: Date.now() - 86400000 * 1,
        views: 98,
        likes: 19,
      },
      {
        name: "Documentation Writer",
        description: "AI agent focused on creating clear, comprehensive technical documentation. Specializes in API docs, README files, code comments, and user guides with markdown formatting.",
        rules: [
          "Write clear and concise documentation",
          "Include practical examples and use cases",
          "Structure documentation with proper headings and sections",
          "Use markdown formatting for better readability",
          "Include installation and setup instructions",
          "Provide troubleshooting and FAQ sections",
          "Keep documentation up-to-date with code changes"
        ],
        category: "Documentation",
        tags: ["Markdown", "Technical Writing", "API Docs", "README"],
        tools: ["Gitiles", "Sphinx", "JSDoc", "Swagger"],
        isPublic: true,
        createdAt: Date.now() - 86400000 * 21,
        updatedAt: Date.now() - 86400000 * 7,
        views: 267,
        likes: 41,
      },
      {
        name: "Docker Deployment Assistant",
        description: "DevOps agent specialized in containerization and deployment strategies. Creates Docker configurations, manages multi-service applications, and optimizes container performance.",
        rules: [
          "Create optimized Dockerfiles with multi-stage builds",
          "Use appropriate base images for security and size",
          "Implement proper environment variable management",
          "Set up health checks and monitoring",
          "Configure docker-compose for multi-service apps",
          "Follow container security best practices",
          "Implement proper logging and debugging strategies"
        ],
        category: "DevOps",
        tags: ["Docker", "Kubernetes", "DevOps", "Deployment", "Containers"],
        tools: ["Docker", "Kubernetes", "docker-compose", "Helm"],
        isPublic: true,
        createdAt: Date.now() - 86400000 * 12,
        updatedAt: Date.now() - 86400000 * 4,
        views: 143,
        likes: 25,
      }
    ];

    // Insert sample agents
    for (const agentData of sampleAgents) {
      await ctx.db.insert("agents", agentData);
    }

    return `Inserted ${sampleAgents.length} sample agents`;
  },
});