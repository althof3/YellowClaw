Requirements
You are expected to build a minimal version of a Chatbot Platform with the following functionality:
● Implement authentication (e.g., JWT/OAuth2) with user registration and login.
● Allow creation of user accounts.
● Allow logging in as a user using email and password
● Allow creation of a project/agent under a user.
● Support storing and associating prompts with a project/agent.
● Implement a chat interface to interact with the agent/project using
○ OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
○ Or, OpenRouter Completion API:
https://openrouter.ai/docs/api-reference/overview
○ Or, any other LLM service of choice
● Good to have: Allow uploading files into a project using OpenAI Files API:
https://platform.openai.com/docs/api-reference/files/create
Non-Functional Requirements
While building the solution, please keep in mind the following aspects:
● Scalability: support multiple users and projects concurrently.
● Security: protect user data and authentication flows.
● Extensibility: design should allow future additions (e.g., analytics, integrations).
● Performance: ensure low-latency chat responses.
● Reliability: handle errors gracefully and ensure stability.
Deliverables
● Source code in a GitHub repository (or similar).
● Instructions to run the application (README).
● Brief architecture/design explanation (Markdown or PDF).
● Publicly hosted Working demo
● Demo recording