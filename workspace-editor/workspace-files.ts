/**
 * Workspace file operations for the workspace-editor plugin.
 * 工作区文件操作
 *
 * Supports reading, writing and listing bootstrap files in the agent workspace.
 * 支持读取、写入和列出 agent 工作区中的启动文件
 *
 * Access is restricted to a whitelist of known filenames.
 * 访问仅限于已知文件名的白名单
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import type { MoltbotConfig } from "openclaw/plugin-sdk";

// ───────────────────────────────────────────────────────────────────────────
// Whitelist of allowed workspace filenames
// 允许访问的工作区文件白名单
// ───────────────────────────────────────────────────────────────────────────

const ALLOWED_FILES = new Set([
  "SOUL.md",       // Agent 灵魂/核心人格定义
  "IDENTITY.md",   // Agent 身份信息
  "TOOLS.md",      // Agent 工具说明
  "USER.md",       // 用户信息
  "HEARTBEAT.md",  // 心跳/定时任务配置
  "BOOTSTRAP.md",  // 启动配置
  "MEMORY.md",     // 记忆文件（大写）
  "memory.md",     // 记忆文件（小写）
  "AGENTS.md",     // 多 Agent 配置
]);

// ───────────────────────────────────────────────────────────────────────────
// Memory directory support / memory 目录支持
// ───────────────────────────────────────────────────────────────────────────

/**
 * Memory directory name
 * 记忆目录名称
 */
const MEMORY_DIR = "memory";

/**
 * Pattern for memory file names (YYYY-MM-DD.md)
 * 记忆文件名模式（YYYY-MM-DD.md）
 */
const MEMORY_FILE_PATTERN = /^\d{4}-\d{2}-\d{2}\.md$/;

/**
 * Check if a filename is a valid memory directory file
 * 检查文件名是否为有效的 memory 目录文件
 *
 * @param fileName - Filename to check (e.g., "memory/2026-01-30.md")
 * @returns true if valid memory file path
 */
function isMemoryFilePath(fileName: string): boolean {
  if (!fileName.startsWith(`${MEMORY_DIR}/`)) {
    return false;
  }
  const baseName = fileName.slice(MEMORY_DIR.length + 1);
  return MEMORY_FILE_PATTERN.test(baseName);
}

// ───────────────────────────────────────────────────────────────────────────
// Type definitions / 类型定义
// ───────────────────────────────────────────────────────────────────────────

/**
 * Information about a workspace file
 * 工作区文件信息
 */
export type WorkspaceFileInfo = {
  name: string;           // 文件名 / Filename
  path: string;           // 完整路径 / Full path
  exists: boolean;        // 是否存在 / Whether file exists
  size: number;           // 文件大小（字节）/ File size in bytes
  modifiedAt: number | null; // 最后修改时间戳 / Last modified timestamp
};

/**
 * Result of listing workspace files
 * 列出工作区文件的结果
 */
export type WorkspaceFilesListResult = {
  workspaceDir: string;   // 工作区目录 / Workspace directory
  agentId: string;        // Agent ID
  files: WorkspaceFileInfo[]; // 文件列表 / File list
};

/**
 * Result of reading a workspace file
 * 读取工作区文件的结果
 */
export type WorkspaceFileReadResult = {
  name: string;           // 文件名 / Filename
  path: string;           // 完整路径 / Full path
  exists: boolean;        // 是否存在 / Whether file exists
  content: string;        // 文件内容 / File content
};

/**
 * Result of writing a workspace file
 * 写入工作区文件的结果
 */
export type WorkspaceFileWriteResult = {
  ok: boolean;            // 是否成功 / Whether successful
  path: string;           // 完整路径 / Full path
  bytesWritten: number;   // 写入字节数 / Bytes written
};

// ───────────────────────────────────────────────────────────────────────────
// Resolve workspace directory / 解析工作区目录
// ───────────────────────────────────────────────────────────────────────────

/**
 * Get default workspace directory
 * 获取默认工作区目录
 *
 * 与核心代码保持一致：~/.openclaw/workspace
 * Consistent with core code: ~/.openclaw/workspace
 */
function resolveDefaultWorkspaceDir(): string {
  return path.join(os.homedir(), ".openclaw", "workspace");
}

/**
 * Resolve workspace directory for a specific agent
 * 解析特定 agent 的工作区目录
 *
 * @param config - Moltbot configuration / Moltbot 配置
 * @param agentId - Optional agent ID / 可选的 agent ID
 * @returns Workspace directory and resolved agent ID / 工作区目录和解析后的 agent ID
 */
function resolveAgentWorkspaceDir(
  config: MoltbotConfig,
  agentId?: string,
): { workspaceDir: string; resolvedAgentId: string } {
  const agents = config.agents as
    | {
        list?: Array<{ id?: string; workspace?: string; default?: boolean }>;
        defaults?: { workspace?: string };
      }
    | undefined;
  const list = agents?.list ?? [];

  // Find the specified agent or the default one
  // 查找指定的 agent 或默认 agent
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
    return {
      workspaceDir,
      resolvedAgentId: agent.id ?? "main",
    };
  }

  // 检查 agents.defaults.workspace（与核心代码一致）
  // Check agents.defaults.workspace (consistent with core code)
  const defaultsWorkspace = agents?.defaults?.workspace?.trim();
  if (defaultsWorkspace) {
    let workspaceDir = defaultsWorkspace;
    if (workspaceDir.startsWith("~")) {
      workspaceDir = path.join(os.homedir(), workspaceDir.slice(1));
    }
    return {
      workspaceDir,
      resolvedAgentId: agent?.id ?? agentId ?? "main",
    };
  }

  return {
    workspaceDir: resolveDefaultWorkspaceDir(),
    resolvedAgentId: agent?.id ?? agentId ?? "main",
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Security: validate filename / 安全性：验证文件名
// ───────────────────────────────────────────────────────────────────────────

/**
 * Validate filename against whitelist and path traversal attacks
 * 验证文件名是否在白名单内，并防止路径遍历攻击
 *
 * @param fileName - Filename to validate / 要验证的文件名
 * @throws Error if filename is invalid / 如果文件名无效则抛出错误
 */
function validateFileName(fileName: string): void {
  // Reject path traversal attacks / 拒绝路径遍历攻击
  if (fileName.includes("\\") || fileName.includes("..")) {
    throw new Error(`Invalid filename: ${fileName}`);
  }

  // Check if it's a memory directory file (memory/YYYY-MM-DD.md)
  // 检查是否为 memory 目录文件
  if (isMemoryFilePath(fileName)) {
    return; // Valid memory file path / 有效的 memory 文件路径
  }

  // Reject other paths with slashes / 拒绝其他包含斜杠的路径
  if (fileName.includes("/")) {
    throw new Error(`Invalid filename: ${fileName}`);
  }

  // Must be in whitelist / 必须在白名单内
  if (!ALLOWED_FILES.has(fileName)) {
    throw new Error(
      `File not allowed: ${fileName}. Allowed files: ${[...ALLOWED_FILES].join(", ")}, memory/YYYY-MM-DD.md`,
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// List workspace files / 列出工作区文件
// ───────────────────────────────────────────────────────────────────────────

/**
 * List all workspace files (from whitelist)
 * 列出所有工作区文件（从白名单）
 *
 * Returns information about each file, including whether it exists.
 * 返回每个文件的信息，包括是否存在。
 *
 * @param config - Moltbot configuration / Moltbot 配置
 * @param agentId - Optional agent ID / 可选的 agent ID
 * @returns List result with files / 包含文件的列表结果
 */
export async function listWorkspaceFiles(
  config: MoltbotConfig,
  agentId?: string,
): Promise<WorkspaceFilesListResult> {
  const { workspaceDir, resolvedAgentId } = resolveAgentWorkspaceDir(
    config,
    agentId,
  );

  const files: WorkspaceFileInfo[] = [];

  // Check each file in the whitelist / 检查白名单中的每个文件
  for (const name of ALLOWED_FILES) {
    const filePath = path.join(workspaceDir, name);
    let exists = false;
    let size = 0;
    let modifiedAt: number | null = null;

    try {
      const stat = await fs.stat(filePath);
      exists = stat.isFile();
      size = stat.size;
      modifiedAt = stat.mtimeMs;
    } catch {
      // File does not exist / 文件不存在
    }

    files.push({
      name,
      path: filePath,
      exists,
      size,
      modifiedAt,
    });
  }

  // Scan memory/ directory for dated files / 扫描 memory/ 目录获取日期文件
  const memoryDir = path.join(workspaceDir, MEMORY_DIR);
  try {
    const memoryFiles = await fs.readdir(memoryDir);
    for (const fileName of memoryFiles) {
      // Only include files matching YYYY-MM-DD.md pattern
      // 仅包含匹配 YYYY-MM-DD.md 模式的文件
      if (!MEMORY_FILE_PATTERN.test(fileName)) {
        continue;
      }

      const filePath = path.join(memoryDir, fileName);
      const relativeName = `${MEMORY_DIR}/${fileName}`;

      try {
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          files.push({
            name: relativeName,
            path: filePath,
            exists: true,
            size: stat.size,
            modifiedAt: stat.mtimeMs,
          });
        }
      } catch {
        // Skip files that can't be stat'd / 跳过无法获取状态的文件
      }
    }
  } catch {
    // memory/ directory does not exist - that's fine
    // memory/ 目录不存在 - 没关系
  }

  // Sort: existing files first, then by category, then alphabetically
  // 排序：已存在的文件优先，按类别分组，然后按字母顺序
  files.sort((a, b) => {
    if (a.exists && !b.exists) return -1;
    if (!a.exists && b.exists) return 1;

    // Group memory/ files together at the end
    // 将 memory/ 文件放在末尾
    const aIsMemory = a.name.startsWith(`${MEMORY_DIR}/`);
    const bIsMemory = b.name.startsWith(`${MEMORY_DIR}/`);
    if (aIsMemory && !bIsMemory) return 1;
    if (!aIsMemory && bIsMemory) return -1;

    // Within memory files, sort by date descending (newest first)
    // memory 文件内部按日期倒序排列（最新的在前）
    if (aIsMemory && bIsMemory) {
      return b.name.localeCompare(a.name);
    }

    return a.name.localeCompare(b.name);
  });

  return {
    workspaceDir,
    agentId: resolvedAgentId,
    files,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Read workspace file / 读取工作区文件
// ───────────────────────────────────────────────────────────────────────────

/**
 * Read content of a workspace file
 * 读取工作区文件内容
 *
 * @param config - Moltbot configuration / Moltbot 配置
 * @param fileName - Name of file to read / 要读取的文件名
 * @param agentId - Optional agent ID / 可选的 agent ID
 * @returns Read result with content / 包含内容的读取结果
 */
export async function readWorkspaceFile(
  config: MoltbotConfig,
  fileName: string,
  agentId?: string,
): Promise<WorkspaceFileReadResult> {
  // Validate filename against whitelist / 验证文件名是否在白名单内
  validateFileName(fileName);

  const { workspaceDir } = resolveAgentWorkspaceDir(config, agentId);
  const filePath = path.join(workspaceDir, fileName);

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
    // File does not exist - return empty content
    // 文件不存在 - 返回空内容
  }

  return {
    name: fileName,
    path: filePath,
    exists,
    content,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Write workspace file / 写入工作区文件
// ───────────────────────────────────────────────────────────────────────────

/**
 * Write content to a workspace file
 * 写入内容到工作区文件
 *
 * Creates the file if it doesn't exist, or overwrites if it does.
 * 如果文件不存在则创建，如果存在则覆盖。
 *
 * @param config - Moltbot configuration / Moltbot 配置
 * @param fileName - Name of file to write / 要写入的文件名
 * @param content - Content to write / 要写入的内容
 * @param agentId - Optional agent ID / 可选的 agent ID
 * @returns Write result / 写入结果
 */
export async function writeWorkspaceFile(
  config: MoltbotConfig,
  fileName: string,
  content: string,
  agentId?: string,
): Promise<WorkspaceFileWriteResult> {
  // Validate filename against whitelist / 验证文件名是否在白名单内
  validateFileName(fileName);

  const { workspaceDir } = resolveAgentWorkspaceDir(config, agentId);
  const filePath = path.join(workspaceDir, fileName);

  // Ensure directory exists / 确保目录存在
  // For memory/ files, also create the memory subdirectory
  // 对于 memory/ 文件，同时创建 memory 子目录
  const fileDir = path.dirname(filePath);
  await fs.mkdir(fileDir, { recursive: true });

  // Write file / 写入文件
  await fs.writeFile(filePath, content, "utf-8");

  return {
    ok: true,
    path: filePath,
    bytesWritten: Buffer.byteLength(content, "utf-8"),
  };
}
