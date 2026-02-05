/**
 * Skills 文件操作
 * Skills file operations
 *
 * 支持读取、写入、列出和创建 skills 目录中的 SKILL.md 文件
 * Supports reading, writing, listing and creating SKILL.md files in skills directories
 *
 * 仅允许操作 managed 和 workspace 来源的技能（可写目录）
 * Only managed and workspace sources are allowed (writable directories)
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import type { MoltbotConfig } from "openclaw/plugin-sdk";

// ───────────────────────────────────────────────────────────────────────────
// 常量定义 / Constants
// ───────────────────────────────────────────────────────────────────────────

/**
 * 技能文件名
 * Skill file name
 */
const SKILL_FILE_NAME = "SKILL.md";

/**
 * 技能名称验证正则（只允许小写字母、数字和连字符）
 * Skill name validation regex (only lowercase letters, numbers and hyphens)
 */
const SKILL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

/**
 * 可编辑的技能来源
 * Editable skill sources
 */
export type SkillSource = "managed" | "workspace";

// ───────────────────────────────────────────────────────────────────────────
// 类型定义 / Type definitions
// ───────────────────────────────────────────────────────────────────────────

/**
 * 技能文件信息
 * Skill file information
 */
export type SkillFileInfo = {
  name: string;              // 技能名称 / Skill name
  path: string;              // SKILL.md 完整路径 / Full path to SKILL.md
  source: SkillSource;       // 来源 / Source
  exists: boolean;           // 是否存在 / Whether file exists
  size: number;              // 文件大小（字节）/ File size in bytes
  modifiedAt: number | null; // 最后修改时间戳 / Last modified timestamp
};

/**
 * 列出技能文件的结果
 * Result of listing skill files
 */
export type SkillFilesListResult = {
  managedDir: string;        // managed 技能目录 / Managed skills directory
  workspaceDir: string;      // workspace 技能目录 / Workspace skills directory
  skills: SkillFileInfo[];   // 技能列表 / Skill list
};

/**
 * 读取技能文件的结果
 * Result of reading a skill file
 */
export type SkillFileReadResult = {
  name: string;              // 技能名称 / Skill name
  path: string;              // 完整路径 / Full path
  source: SkillSource;       // 来源 / Source
  exists: boolean;           // 是否存在 / Whether file exists
  content: string;           // 文件内容 / File content
};

/**
 * 写入技能文件的结果
 * Result of writing a skill file
 */
export type SkillFileWriteResult = {
  ok: boolean;               // 是否成功 / Whether successful
  path: string;              // 完整路径 / Full path
  bytesWritten: number;      // 写入字节数 / Bytes written
};

/**
 * 创建技能的结果
 * Result of creating a skill
 */
export type SkillFileCreateResult = {
  ok: boolean;               // 是否成功 / Whether successful
  name: string;              // 技能名称 / Skill name
  path: string;              // SKILL.md 完整路径 / Full path to SKILL.md
  source: SkillSource;       // 来源 / Source
};

/**
 * 删除技能的结果
 * Result of deleting a skill
 */
export type SkillFileDeleteResult = {
  ok: boolean;               // 是否成功 / Whether successful
  name: string;              // 技能名称 / Skill name
  path: string;              // 已删除目录路径 / Deleted directory path
};

// ───────────────────────────────────────────────────────────────────────────
// 目录解析 / Directory resolution
// ───────────────────────────────────────────────────────────────────────────

/**
 * 解析配置目录（~/.openclaw）
 * Resolve config directory (~/.openclaw)
 *
 * 与核心代码 src/utils.ts 保持一致：始终使用 ~/.openclaw
 * Consistent with core code src/utils.ts: always use ~/.openclaw
 */
function resolveConfigDir(): string {
  const override =
    process.env.OPENCLAW_STATE_DIR?.trim() ||
    process.env.CLAWDBOT_STATE_DIR?.trim();
  if (override) {
    return override.startsWith("~")
      ? path.join(os.homedir(), override.slice(1))
      : override;
  }
  // 始终使用 .openclaw（与核心代码一致）
  // Always use .openclaw (consistent with core code)
  return path.join(os.homedir(), ".openclaw");
}

/**
 * 解析默认工作区目录
 * Resolve default workspace directory
 *
 * 与核心代码保持一致：~/.openclaw/workspace
 * Consistent with core code: ~/.openclaw/workspace
 */
function resolveDefaultWorkspaceDir(): string {
  return path.join(os.homedir(), ".openclaw", "workspace");
}

/**
 * 解析 Agent 的工作区目录
 * Resolve workspace directory for an agent
 *
 * 与核心代码保持一致的解析逻辑
 * Consistent with core code resolution logic
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @returns 工作区目录 / Workspace directory
 */
function resolveAgentWorkspaceDir(
  config: MoltbotConfig,
  agentId?: string,
): string {
  const agents = config.agents as
    | {
        list?: Array<{ id?: string; workspace?: string; default?: boolean }>;
        defaults?: { workspace?: string };
      }
    | undefined;
  const list = agents?.list ?? [];

  // 查找指定的 agent 或默认 agent
  // Find the specified agent or default agent
  const agent = agentId
    ? list.find((a) => a.id === agentId)
    : list.find((a) => a.default) ?? list[0];

  // 如果找到 agent 并且有 workspace 配置
  // If agent found and has workspace config
  if (agent?.workspace?.trim()) {
    let workspaceDir = agent.workspace.trim();
    if (workspaceDir.startsWith("~")) {
      workspaceDir = path.join(os.homedir(), workspaceDir.slice(1));
    }
    return workspaceDir;
  }

  // 检查 agents.defaults.workspace（与核心代码一致）
  // Check agents.defaults.workspace (consistent with core code)
  const defaultsWorkspace = agents?.defaults?.workspace?.trim();
  if (defaultsWorkspace) {
    let workspaceDir = defaultsWorkspace;
    if (workspaceDir.startsWith("~")) {
      workspaceDir = path.join(os.homedir(), workspaceDir.slice(1));
    }
    return workspaceDir;
  }

  return resolveDefaultWorkspaceDir();
}

/**
 * 解析 managed 和 workspace 技能目录
 * Resolve managed and workspace skills directories
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @returns 两个技能目录路径 / Both skills directory paths
 */
function resolveSkillDirs(
  config: MoltbotConfig,
  agentId?: string,
): { managedDir: string; workspaceDir: string } {
  const configDir = resolveConfigDir();
  const workspaceBase = resolveAgentWorkspaceDir(config, agentId);

  return {
    managedDir: path.join(configDir, "skills"),
    workspaceDir: path.join(workspaceBase, "skills"),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// 安全验证 / Security validation
// ───────────────────────────────────────────────────────────────────────────

/**
 * 验证技能名称是否合法
 * Validate skill name
 *
 * @param skillName - 技能名称 / Skill name
 * @throws 如果名称无效则抛出错误 / Throws error if name is invalid
 */
function validateSkillName(skillName: string): void {
  // 防止路径遍历攻击 / Prevent path traversal attacks
  if (skillName.includes("/") || skillName.includes("\\") || skillName.includes("..")) {
    throw new Error(`无效的技能名称（包含非法字符）: ${skillName}`);
  }

  // 验证名称格式 / Validate name format
  if (!SKILL_NAME_PATTERN.test(skillName)) {
    throw new Error(
      `无效的技能名称格式: ${skillName}。技能名称只能包含小写字母、数字和连字符，且不能以连字符开头或结尾`,
    );
  }
}

/**
 * 验证技能来源是否可编辑
 * Validate skill source is editable
 *
 * @param source - 技能来源 / Skill source
 * @throws 如果来源不可编辑则抛出错误 / Throws error if source is not editable
 */
function validateSource(source: string): asserts source is SkillSource {
  if (source !== "managed" && source !== "workspace") {
    throw new Error(
      `不支持的技能来源: ${source}。仅支持 "managed" 和 "workspace"`,
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 列出技能文件 / List skill files
// ───────────────────────────────────────────────────────────────────────────

/**
 * 扫描目录中的技能
 * Scan skills in a directory
 *
 * @param dir - 技能目录 / Skills directory
 * @param source - 来源标识 / Source identifier
 * @returns 技能文件信息列表 / List of skill file info
 */
async function scanSkillsInDir(
  dir: string,
  source: SkillSource,
): Promise<SkillFileInfo[]> {
  const skills: SkillFileInfo[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      // 只处理目录（每个技能是一个目录）
      // Only process directories (each skill is a directory)
      if (!entry.isDirectory()) continue;

      // 跳过隐藏目录和无效名称
      // Skip hidden directories and invalid names
      if (entry.name.startsWith(".")) continue;
      if (!SKILL_NAME_PATTERN.test(entry.name)) continue;

      const skillDir = path.join(dir, entry.name);
      const skillFilePath = path.join(skillDir, SKILL_FILE_NAME);

      let exists = false;
      let size = 0;
      let modifiedAt: number | null = null;

      try {
        const stat = await fs.stat(skillFilePath);
        exists = stat.isFile();
        size = stat.size;
        modifiedAt = stat.mtimeMs;
      } catch {
        // SKILL.md 不存在
        // SKILL.md doesn't exist
      }

      skills.push({
        name: entry.name,
        path: skillFilePath,
        source,
        exists,
        size,
        modifiedAt,
      });
    }
  } catch {
    // 目录不存在或无法读取
    // Directory doesn't exist or cannot be read
  }

  return skills;
}

/**
 * 列出所有可编辑的技能文件
 * List all editable skill files
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @param sourceFilter - 可选的来源过滤 / Optional source filter
 * @returns 技能列表结果 / Skill list result
 */
export async function listSkillFiles(
  config: MoltbotConfig,
  agentId?: string,
  sourceFilter?: SkillSource,
): Promise<SkillFilesListResult> {
  const { managedDir, workspaceDir } = resolveSkillDirs(config, agentId);

  let skills: SkillFileInfo[] = [];

  // 扫描 managed 技能 / Scan managed skills
  if (!sourceFilter || sourceFilter === "managed") {
    const managedSkills = await scanSkillsInDir(managedDir, "managed");
    skills = skills.concat(managedSkills);
  }

  // 扫描 workspace 技能 / Scan workspace skills
  if (!sourceFilter || sourceFilter === "workspace") {
    const workspaceSkills = await scanSkillsInDir(workspaceDir, "workspace");
    skills = skills.concat(workspaceSkills);
  }

  // 按名称排序，workspace 优先（覆盖 managed）
  // Sort by name, workspace first (overrides managed)
  skills.sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    // workspace 排在 managed 前面
    // workspace comes before managed
    return a.source === "workspace" ? -1 : 1;
  });

  return {
    managedDir,
    workspaceDir,
    skills,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// 读取技能文件 / Read skill file
// ───────────────────────────────────────────────────────────────────────────

/**
 * 读取技能的 SKILL.md 文件内容
 * Read SKILL.md file content of a skill
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param skillName - 技能名称 / Skill name
 * @param source - 技能来源 / Skill source
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @returns 读取结果 / Read result
 */
export async function readSkillFile(
  config: MoltbotConfig,
  skillName: string,
  source: string,
  agentId?: string,
): Promise<SkillFileReadResult> {
  // 验证参数 / Validate parameters
  validateSkillName(skillName);
  validateSource(source);

  const { managedDir, workspaceDir } = resolveSkillDirs(config, agentId);
  const baseDir = source === "managed" ? managedDir : workspaceDir;
  const filePath = path.join(baseDir, skillName, SKILL_FILE_NAME);

  let exists = false;
  let content = "";

  try {
    content = await fs.readFile(filePath, "utf-8");
    exists = true;
  } catch (err) {
    const anyErr = err as { code?: string };
    if (anyErr.code !== "ENOENT") {
      throw err;
    }
    // 文件不存在 - 返回空内容
    // File doesn't exist - return empty content
  }

  return {
    name: skillName,
    path: filePath,
    source,
    exists,
    content,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// 写入技能文件 / Write skill file
// ───────────────────────────────────────────────────────────────────────────

/**
 * 写入技能的 SKILL.md 文件
 * Write SKILL.md file for a skill
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param skillName - 技能名称 / Skill name
 * @param content - 文件内容 / File content
 * @param source - 技能来源 / Skill source
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @returns 写入结果 / Write result
 */
export async function writeSkillFile(
  config: MoltbotConfig,
  skillName: string,
  content: string,
  source: string,
  agentId?: string,
): Promise<SkillFileWriteResult> {
  // 验证参数 / Validate parameters
  validateSkillName(skillName);
  validateSource(source);

  const { managedDir, workspaceDir } = resolveSkillDirs(config, agentId);
  const baseDir = source === "managed" ? managedDir : workspaceDir;
  const skillDir = path.join(baseDir, skillName);
  const filePath = path.join(skillDir, SKILL_FILE_NAME);

  // 确保技能目录存在 / Ensure skill directory exists
  await fs.mkdir(skillDir, { recursive: true });

  // 写入文件 / Write file
  await fs.writeFile(filePath, content, "utf-8");

  return {
    ok: true,
    path: filePath,
    bytesWritten: Buffer.byteLength(content, "utf-8"),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// 创建技能 / Create skill
// ───────────────────────────────────────────────────────────────────────────

/**
 * 默认技能模板
 * Default skill template
 */
const DEFAULT_SKILL_TEMPLATE = `---
name: "{{SKILL_NAME}}"
emoji:
description: 在此描述技能的功能
homepage:
requirements:
  bins: []
  env: []
  config: []
  os: []
  anyBins: []
install: []
---

# {{SKILL_NAME}}

在此编写技能的详细说明，指导 Agent 如何使用此技能。

## 用法

描述典型的使用场景和命令。

## 示例

提供具体的示例。
`;

/**
 * 创建新技能
 * Create a new skill
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param skillName - 技能名称 / Skill name
 * @param source - 技能来源 / Skill source
 * @param content - 可选的初始内容（默认使用模板）/ Optional initial content (uses template by default)
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @returns 创建结果 / Create result
 */
export async function createSkill(
  config: MoltbotConfig,
  skillName: string,
  source: string,
  content?: string,
  agentId?: string,
): Promise<SkillFileCreateResult> {
  // 验证参数 / Validate parameters
  validateSkillName(skillName);
  validateSource(source);

  const { managedDir, workspaceDir } = resolveSkillDirs(config, agentId);
  const baseDir = source === "managed" ? managedDir : workspaceDir;
  const skillDir = path.join(baseDir, skillName);
  const filePath = path.join(skillDir, SKILL_FILE_NAME);

  // 检查技能是否已存在 / Check if skill already exists
  try {
    await fs.access(skillDir);
    throw new Error(`技能 "${skillName}" 已存在于 ${source} 目录`);
  } catch (err) {
    const anyErr = err as { code?: string };
    if (anyErr.code !== "ENOENT") {
      throw err;
    }
    // 目录不存在，可以创建
    // Directory doesn't exist, can create
  }

  // 创建技能目录 / Create skill directory
  await fs.mkdir(skillDir, { recursive: true });

  // 使用提供的内容或默认模板 / Use provided content or default template
  const fileContent =
    content ?? DEFAULT_SKILL_TEMPLATE.replace(/\{\{SKILL_NAME\}\}/g, skillName);

  // 写入 SKILL.md / Write SKILL.md
  await fs.writeFile(filePath, fileContent, "utf-8");

  return {
    ok: true,
    name: skillName,
    path: filePath,
    source,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// 删除技能 / Delete skill
// ───────────────────────────────────────────────────────────────────────────

/**
 * 删除技能
 * Delete a skill
 *
 * @param config - Moltbot 配置 / Moltbot configuration
 * @param skillName - 技能名称 / Skill name
 * @param source - 技能来源 / Skill source
 * @param agentId - 可选的 Agent ID / Optional agent ID
 * @returns 删除结果 / Delete result
 */
export async function deleteSkill(
  config: MoltbotConfig,
  skillName: string,
  source: string,
  agentId?: string,
): Promise<SkillFileDeleteResult> {
  // 验证参数 / Validate parameters
  validateSkillName(skillName);
  validateSource(source);

  const { managedDir, workspaceDir } = resolveSkillDirs(config, agentId);
  const baseDir = source === "managed" ? managedDir : workspaceDir;
  const skillDir = path.join(baseDir, skillName);

  // 检查技能目录是否存在 / Check if skill directory exists
  try {
    await fs.access(skillDir);
  } catch {
    throw new Error(`技能 "${skillName}" 不存在于 ${source} 目录`);
  }

  // 递归删除技能目录 / Recursively delete skill directory
  await fs.rm(skillDir, { recursive: true, force: true });

  return {
    ok: true,
    name: skillName,
    path: skillDir,
  };
}
