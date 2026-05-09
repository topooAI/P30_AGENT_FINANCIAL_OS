/**
 * lib/constants/providers.ts
 * ToMesh IA 5.0 - 供应商元数据库
 */

export interface ProviderMetadata {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
  icon: string;
  logoUrl: string;
  officialSite: string;
  verificationPattern: string; // 用于校验 Key 真实性的模型 ID 特征正则
}

export const PROVIDERS: ProviderMetadata[] = [
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    description: "Industry standard LLMs including GPT-4o and GPT-3.5.",
    icon: "O",
    logoUrl: "/providers/openai.png",
    officialSite: "https://openai.com",
    verificationPattern: "gpt-",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    baseUrl: "https://api.anthropic.com/v1",
    description: "Claude 3.5 Sonnet, Opus & Haiku. Secure and ethical AI.",
    icon: "A",
    logoUrl: "/providers/anthropic.ico",
    officialSite: "https://anthropic.com",
    verificationPattern: "claude-",
  },
  {
    id: "google-gemini",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    description: "Gemini 1.5 Pro & Flash with massive context windows.",
    icon: "G",
    logoUrl: "/providers/google-gemini.ico",
    officialSite: "https://ai.google.dev",
    verificationPattern: "gemini-",
  },
  {
    id: "nvidia-nim",
    name: "NVIDIA NIM",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    description: "Optimized inference for Llama 3, Mistral, and more on NVIDIA infrastructure.",
    icon: "N",
    logoUrl: "/providers/nvidia-nim.ico",
    officialSite: "https://www.nvidia.com/en-us/ai-data-science/generative-ai/nim/",
    verificationPattern: "nvidia/|meta/|mistralai/|google/|microsoft/|llama|mistral|mixtral",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    description: "High-performance, cost-effective models from DeepSeek AI.",
    icon: "D",
    logoUrl: "/providers/deepseek.ico",
    officialSite: "https://deepseek.com",
    verificationPattern: "deepseek-",
  },
  {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    description: "LPU™ powered inference for world-leading speed.",
    icon: "Q",
    logoUrl: "/providers/groq.ico",
    officialSite: "https://groq.com",
    verificationPattern: "llama|mixtral|gemma",
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    baseUrl: "https://api.siliconflow.cn/v1",
    description: "Aggregated high-speed inference for open-source models.",
    icon: "S",
    logoUrl: "/providers/siliconflow.ico",
    officialSite: "https://siliconflow.cn",
    verificationPattern: "qwen|deepseek|llama|yi|internlm|gemma|mistral|mixtral|baichuan|chatglm|glm",
  },
  {
    id: "together",
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    description: "Global standard for open-source AI hosting.",
    icon: "T",
    logoUrl: "/providers/together.png",
    officialSite: "https://together.ai",
    verificationPattern: "togethercomputer/",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    baseUrl: "https://api.mistral.ai/v1",
    description: "Open models from Europe including Mistral Large & Mixtral.",
    icon: "M",
    logoUrl: "/providers/mistral.ico",
    officialSite: "https://mistral.ai",
    verificationPattern: "mistral-",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    baseUrl: "https://api.perplexity.ai",
    description: "Llama-3 and Mistral base models optimized for search.",
    icon: "P",
    logoUrl: "/providers/perplexity.ico",
    officialSite: "https://perplexity.ai",
    verificationPattern: "llama-3|sonar-",
  },
  {
    id: "codex",
    name: "Codex / Copilot",
    baseUrl: "https://api.githubcopilot.com",
    description: "GitHub Copilot derived API. High-performance coding assistant.",
    icon: "C",
    logoUrl: "/providers/codex.ico",
    officialSite: "https://github.com/features/copilot",
    verificationPattern: "gpt-4|gpt-3.5",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    baseUrl: "https://{resource}.openai.azure.com/openai/deployments/{id}",
    description: "Enterprise OpenAI instances on Microsoft cloud.",
    icon: "Z",
    logoUrl: "/providers/azure.ico",
    officialSite: "https://azure.microsoft.com",
  },
  {
    id: "bedrock",
    name: "Amazon Bedrock",
    baseUrl: "https://bedrock-runtime.{region}.amazonaws.com",
    description: "Fully managed AI service from AWS.",
    icon: "B",
    logoUrl: "/providers/bedrock.ico",
    officialSite: "https://aws.amazon.com/bedrock/",
  },
];

/**
 * 简化模型名称：移除已知厂商前缀，保持界面整洁
 */
export function simplifyModelName(name: string): string {
  if (!name) return "";
  const prefixes = ["nvidia/", "meta/", "mistralai/", "google/", "microsoft/", "ibm/", "snowflake/"];
  let cleanName = name.toLowerCase();
  for (const prefix of prefixes) {
    if (cleanName.startsWith(prefix)) {
      return name.slice(prefix.length);
    }
  }
  return name;
}
