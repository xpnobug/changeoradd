/**
 * workspace-editor plugin
 * 工作区编辑器插件
 *
 * Registers Gateway RPC methods for listing, reading and writing workspace
 * bootstrap files (SOUL.md, IDENTITY.md, TOOLS.md, USER.md, etc.).
 * 注册 Gateway RPC 方法，用于列出、读取和写入工作区启动文件
 * （SOUL.md, IDENTITY.md, TOOLS.md, USER.md 等）
 *
 * The plugin resolves the workspace directory for the requested agent (or the
 * default agent) and restricts file access to a known whitelist.
 * 插件会解析请求的 agent（或默认 agent）的工作区目录，
 * 并将文件访问限制在已知的白名单内
 *
 * 同时提供技能文件（SKILL.md）的列出、读取、写入、创建和删除功能
 * Also provides skill file (SKILL.md) listing, reading, writing, creating and deleting
 */
import type { MoltbotPluginApi } from "openclaw/plugin-sdk";
import {
  listWorkspaceFiles,
  readWorkspaceFile,
  writeWorkspaceFile,
} from "./workspace-files.js";
import {
  listSkillFiles,
  readSkillFile,
  writeSkillFile,
  createSkill,
  deleteSkill,
  type SkillSource,
} from "./skills-files.js";

const plugin = {
  id: "workspace-editor",
  name: "Workspace Editor",
  description: "Read/write workspace bootstrap files via Gateway RPC",

  /**
   * Register plugin methods
   * 注册插件方法
   */
  register(api: MoltbotPluginApi) {
    // ── workspace.files.list ──────────────────────────────────────────
    // 列出工作区文件 / List workspace files
    api.registerGatewayMethod(
      "workspace.files.list",
      async ({ params, respond }) => {
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await listWorkspaceFiles(api.config, agentId);
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "WORKSPACE_ERROR",
            message: String(err),
          });
        }
      },
    );

    // ── workspace.file.read ───────────────────────────────────────────
    // 读取工作区文件 / Read workspace file
    api.registerGatewayMethod(
      "workspace.file.read",
      async ({ params, respond }) => {
        // 验证必需的 fileName 参数 / Validate required fileName parameter
        const fileName =
          typeof params.fileName === "string" ? params.fileName.trim() : "";
        if (!fileName) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: "fileName is required",
          });
          return;
        }
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await readWorkspaceFile(api.config, fileName, agentId);
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "WORKSPACE_ERROR",
            message: String(err),
          });
        }
      },
    );

    // ── workspace.file.write ──────────────────────────────────────────
    // 写入工作区文件 / Write workspace file
    api.registerGatewayMethod(
      "workspace.file.write",
      async ({ params, respond }) => {
        // 验证必需的 fileName 参数 / Validate required fileName parameter
        const fileName =
          typeof params.fileName === "string" ? params.fileName.trim() : "";
        if (!fileName) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: "fileName is required",
          });
          return;
        }
        // 获取文件内容（默认为空字符串）/ Get file content (default to empty string)
        const content =
          typeof params.content === "string" ? params.content : "";
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await writeWorkspaceFile(
            api.config,
            fileName,
            content,
            agentId,
          );
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "WORKSPACE_ERROR",
            message: String(err),
          });
        }
      },
    );

    // =========================================================================
    // Skills 文件操作 / Skills file operations
    // =========================================================================

    // ── skills.files.list ───────────────────────────────────────────────
    // 列出可编辑的技能文件 / List editable skill files
    api.registerGatewayMethod(
      "skills.files.list",
      async ({ params, respond }) => {
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          // 解析可选的 source 过滤参数 / Parse optional source filter parameter
          const sourceFilter =
            typeof params.source === "string" &&
            (params.source === "managed" || params.source === "workspace")
              ? (params.source as SkillSource)
              : undefined;
          const result = await listSkillFiles(api.config, agentId, sourceFilter);
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "SKILLS_ERROR",
            message: String(err),
          });
        }
      },
    );

    // ── skills.file.read ────────────────────────────────────────────────
    // 读取技能文件 (SKILL.md) / Read skill file (SKILL.md)
    api.registerGatewayMethod(
      "skills.file.read",
      async ({ params, respond }) => {
        // 验证必需的 skillName 参数 / Validate required skillName parameter
        const skillName =
          typeof params.skillName === "string" ? params.skillName.trim() : "";
        if (!skillName) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: "skillName is required",
          });
          return;
        }
        // 验证必需的 source 参数 / Validate required source parameter
        const source =
          typeof params.source === "string" ? params.source.trim() : "";
        if (!source || (source !== "managed" && source !== "workspace" && source !== "bundled")) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: 'source is required and must be "managed", "workspace" or "bundled"',
          });
          return;
        }
        // bundled 技能需要 filePath 参数 / bundled skills require filePath parameter
        const filePath =
          typeof params.filePath === "string" ? params.filePath.trim() : undefined;
        if (source === "bundled" && !filePath) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: 'filePath is required for bundled skills',
          });
          return;
        }
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await readSkillFile(
            api.config,
            skillName,
            source,
            agentId,
            filePath,
          );
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "SKILLS_ERROR",
            message: String(err),
          });
        }
      },
    );

    // ── skills.file.write ───────────────────────────────────────────────
    // 写入技能文件 (SKILL.md) / Write skill file (SKILL.md)
    api.registerGatewayMethod(
      "skills.file.write",
      async ({ params, respond }) => {
        // 验证必需的 skillName 参数 / Validate required skillName parameter
        const skillName =
          typeof params.skillName === "string" ? params.skillName.trim() : "";
        if (!skillName) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: "skillName is required",
          });
          return;
        }
        // 验证必需的 source 参数 / Validate required source parameter
        const source =
          typeof params.source === "string" ? params.source.trim() : "";
        if (!source || (source !== "managed" && source !== "workspace")) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: 'source is required and must be "managed" or "workspace"',
          });
          return;
        }
        // 获取文件内容（默认为空字符串）/ Get file content (default to empty string)
        const content =
          typeof params.content === "string" ? params.content : "";
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await writeSkillFile(
            api.config,
            skillName,
            content,
            source,
            agentId,
          );
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "SKILLS_ERROR",
            message: String(err),
          });
        }
      },
    );

    // ── skills.file.create ──────────────────────────────────────────────
    // 创建新技能 / Create new skill
    api.registerGatewayMethod(
      "skills.file.create",
      async ({ params, respond }) => {
        // 验证必需的 skillName 参数 / Validate required skillName parameter
        const skillName =
          typeof params.skillName === "string" ? params.skillName.trim() : "";
        if (!skillName) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: "skillName is required",
          });
          return;
        }
        // 验证必需的 source 参数 / Validate required source parameter
        const source =
          typeof params.source === "string" ? params.source.trim() : "";
        if (!source || (source !== "managed" && source !== "workspace")) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: 'source is required and must be "managed" or "workspace"',
          });
          return;
        }
        // 获取可选的初始内容 / Get optional initial content
        const content =
          typeof params.content === "string" ? params.content : undefined;
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await createSkill(
            api.config,
            skillName,
            source,
            content,
            agentId,
          );
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "SKILLS_ERROR",
            message: String(err),
          });
        }
      },
    );

    // ── skills.file.delete ──────────────────────────────────────────────
    // 删除技能 / Delete skill
    api.registerGatewayMethod(
      "skills.file.delete",
      async ({ params, respond }) => {
        // 验证必需的 skillName 参数 / Validate required skillName parameter
        const skillName =
          typeof params.skillName === "string" ? params.skillName.trim() : "";
        if (!skillName) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: "skillName is required",
          });
          return;
        }
        // 验证必需的 source 参数 / Validate required source parameter
        const source =
          typeof params.source === "string" ? params.source.trim() : "";
        if (!source || (source !== "managed" && source !== "workspace")) {
          respond(false, undefined, {
            code: "INVALID_REQUEST",
            message: 'source is required and must be "managed" or "workspace"',
          });
          return;
        }
        try {
          // 解析可选的 agentId 参数 / Parse optional agentId parameter
          const agentId =
            typeof params.agentId === "string"
              ? params.agentId.trim() || undefined
              : undefined;
          const result = await deleteSkill(
            api.config,
            skillName,
            source,
            agentId,
          );
          respond(true, result, undefined);
        } catch (err) {
          respond(false, undefined, {
            code: "SKILLS_ERROR",
            message: String(err),
          });
        }
      },
    );
  },
};

export default plugin;
