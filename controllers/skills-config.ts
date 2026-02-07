/**
 * 技能配置控制器
 * Skills config controller
 *
 * ⚠️ 此文件已重构，实际实现已拆分到 ./skills/ 目录
 * 保留此文件以保持向后兼容
 */

// 从新模块重新导出所有内容
export type {
  SkillsConfigState,
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
  LoadSkillsOptions,
} from "./skills";

export {
  // 状态和辅助函数
  createInitialSkillsConfigState,
  hasSkillsConfigChanges,
  hasEditorChanges,
  // 数据加载/保存
  loadSkillsStatus,
  saveSkillsConfig,
  updateGlobalSetting,
  updateExtraDirs,
  // 技能操作
  updateSkillEnabled,
  saveSkillApiKey,
  installSkillDependency,
  // UI 状态
  updateSkillsFilter,
  updateSkillsSourceFilter,
  updateSkillsStatusFilter,
  toggleSkillsGroup,
  selectSkill,
  updateSkillApiKeyEdit,
  updateSkillEnv,
  removeSkillEnv,
  updateSkillConfig,
  setAllowlistMode,
  toggleAllowlistEntry,
  // 编辑器操作
  openSkillEditor,
  closeSkillEditor,
  updateEditorContent,
  updateEditorMode,
  saveSkillFile,
  // 创建/删除/预览操作
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
} from "./skills";
