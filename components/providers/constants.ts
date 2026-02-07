/**
 * 供应商配置常量和类型
 * Provider config constants and types
 */
import type { ModelApi, AuthMode } from "../../views/model-config";
import {
  providerIcon,
  plusIcon,
  trashIcon,
  chevronDownIcon,
  settingsIcon,
  infoIcon,
  xIcon,
} from "../icons";

// ─── 图标映射 / Icon mapping ────────────────────────────────────────────────

export const icons = {
  provider: providerIcon,
  add: plusIcon,
  trash: trashIcon,
  chevron: chevronDownIcon,
  settings: settingsIcon,
  info: infoIcon,
  close: xIcon,
};

// ─── API 协议配置 / API protocol config ─────────────────────────────────────

export const API_PROTOCOLS: Array<{ value: ModelApi; label: string; hint: string }> = [
  {
    value: "openai-completions",
    label: "OpenAI Completions",
    hint: "OpenAI 兼容 API（大多数供应商）",
  },
  { value: "openai-responses", label: "OpenAI Responses", hint: "OpenAI 新版 Responses API" },
  { value: "anthropic-messages", label: "Anthropic Messages", hint: "Anthropic Claude API" },
  { value: "google-generative-ai", label: "Google Generative AI", hint: "Google Gemini API" },
  { value: "github-copilot", label: "GitHub Copilot", hint: "GitHub Copilot 模型" },
  { value: "bedrock-converse-stream", label: "AWS Bedrock", hint: "AWS Bedrock Converse API" },
];

// ─── 认证模式配置 / Auth mode config ────────────────────────────────────────

export const AUTH_MODES: Array<{ value: AuthMode; label: string; hint: string }> = [
  { value: "api-key", label: "API Key", hint: "标准 API 密钥认证" },
  { value: "aws-sdk", label: "AWS SDK", hint: "使用 AWS 凭证（IAM / 环境变量）" },
  { value: "oauth", label: "OAuth", hint: "OAuth 令牌认证" },
  { value: "token", label: "Bearer Token", hint: "Bearer Token 认证" },
];

// ─── 中文标签 / Chinese labels ──────────────────────────────────────────────

export const LABELS = {
  providersTitle: "模型供应商",
  providersDesc: "配置 LLM 模型供应商，支持 OpenAI、Anthropic、Google、AWS Bedrock 等",
  addProvider: "添加供应商",
  providerName: "供应商名称",
  providerNamePlaceholder: "输入供应商名称，如: openai、my-ollama",
  providerBaseUrl: "API 地址",
  providerBaseUrlPlaceholder: "https://api.example.com/v1",
  providerApiKey: "API 密钥",
  providerApiKeyPlaceholder: "sk-... 或 ${ENV_VAR}",
  providerProtocol: "API 协议",
  providerAuth: "认证方式",
  providerHeaders: "自定义 Headers",
  headersHint: "可选：添加额外的请求头",
  addHeader: "添加 Header",
  headerKey: "Header 名称",
  headerValue: "Header 值",
  noProviders: "尚未配置任何模型供应商",
  modelId: "模型 ID",
  modelName: "显示名称",
  modelReasoning: "推理模型",
  modelContext: "上下文",
  modelMaxTokens: "最大输出",
  modelInput: "输入类型",
  inputText: "文本",
  inputImage: "图片",
  addModel: "添加模型",
  modelCount: "个模型",
  advancedConfig: "高级配置",
  showAdvanced: "显示高级选项",
  hideAdvanced: "隐藏高级选项",
  modelCost: "成本配置",
  costInput: "输入",
  costOutput: "输出",
  costCacheRead: "缓存读",
  costCacheWrite: "缓存写",
  costUnit: "$/M tokens",
  modelCompat: "兼容性配置",
  compatStore: "Store",
  compatDeveloper: "Developer Role",
  compatReasoning: "Reasoning Effort",
  compatMaxTokens: "max_tokens 字段",
  maxTokensField: "max_tokens",
  maxCompletionTokensField: "max_completion_tokens",
  // 弹窗相关
  createProvider: "创建供应商",
  cancel: "取消",
  confirm: "确认创建",
};

// ─── 类型定义 / Type definitions ────────────────────────────────────────────

export type ProviderFormState = {
  name: string;
  baseUrl: string;
  apiKey: string;
  api: ModelApi;
  auth: AuthMode;
};

export const DEFAULT_PROVIDER_FORM: ProviderFormState = {
  name: "",
  baseUrl: "",
  apiKey: "",
  api: "openai-completions",
  auth: "api-key",
};

// ─── 重新导出依赖类型 / Re-export dependent types ───────────────────────────

export type { ProviderConfig, ModelConfig, ModelApi, AuthMode } from "../../views/model-config";
