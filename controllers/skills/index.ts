/**
 * 技能配置控制器导出
 * Skills config controller exports
 */

// 类型
export type { SkillsConfigState } from "./types";
export type {
  SkillStatusReport,
  SkillsConfig,
  SkillSourceFilter,
  SkillStatusFilter,
  SkillEditState,
  SkillMessage,
  SkillEditorState,
  SkillCreateState,
  SkillDeleteState,
  SkillPreviewState,
  EditableSkillSource,
  SkillEditorMode,
} from "./types";

// 状态和辅助函数
export {
  createInitialSkillsConfigState,
  getErrorMessage,
  setSkillMessage,
  hasSkillsConfigChanges,
  hasEditorChanges,
} from "./state";

// 数据加载/保存
export type { LoadSkillsOptions } from "./loader";
export {
  loadSkillsStatus,
  saveSkillsConfig,
  updateSkillsConfigField,
  updateGlobalSetting,
  updateExtraDirs,
} from "./loader";

// 技能操作
export {
  updateSkillEnabled,
  saveSkillApiKey,
  installSkillDependency,
} from "./actions";

// UI 状态
export {
  updateSkillsFilter,
  updateSkillsSourceFilter,
  updateSkillsStatusFilter,
  toggleSkillsGroup,
  selectSkill,
  updateSkillApiKeyEdit,
  updateSkillEnabledEdit,
  updateSkillEnv,
  removeSkillEnv,
  updateSkillConfig,
  setAllowlistMode,
  toggleAllowlistEntry,
} from "./ui-state";

// 编辑器操作
export {
  openSkillEditor,
  closeSkillEditor,
  updateEditorContent,
  updateEditorMode,
  saveSkillFile,
} from "./editor";

// 创建/删除/预览操作
export {
  openCreateSkill,
  closeCreateSkill,
  updateCreateSkillName,
  updateCreateSkillSource,
  confirmCreateSkill,
  openDeleteSkill,
  closeDeleteSkill,
  confirmDeleteSkill,
  openSkillPreview,
  closeSkillPreview,
} from "./crud";
