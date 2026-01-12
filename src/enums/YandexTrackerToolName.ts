export enum YandexTrackerToolName {
  getIssue = "getIssueTool",
  getMySelf = "getMySelfTool",
  getQueues = "getQueuesTool",
  getUser = "getUserTool",
  searchIssueByFilter = "searchIssueByFilterTool",
  searchIssueByQuery = "searchIssueByQueryTool",
  getIssueTypes = "getIssueTypesTool",
  getIssuePriorityTypes = "getIssuePriorityTypesTool",
  getIssueStatusTypes = "getIssueStatusTypesTool",
  getIssueFields = "getIssueFieldsTool",
  getQueueFields = "getQueueFieldsTool",
  getUserFields = "getUserFieldsTool",
  getUsers = "getTrackerUsersTool",
  getYandexQueryDoc = "getYandexQueryDocTool",
  // Новые инструменты для создания/редактирования
  createIssue = "createIssueTool",
  updateIssue = "updateIssueTool",
  addComment = "addCommentTool",
  getComments = "getCommentsTool",
  getTransitions = "getTransitionsTool",
  transitionIssue = "transitionIssueTool",
  // Инструменты для работы со связями задач
  linkIssue = "linkIssueTool",
  getLinks = "getLinksTool",
  deleteLink = "deleteLinkTool",
  // Инструмент для удаления задачи
  deleteIssue = "deleteIssueTool",
  // Инструменты для работы с вложениями
  attachFileToIssue = "attachFileToIssueTool",
  getIssueAttachments = "getIssueAttachmentsTool",
  deleteIssueAttachment = "deleteIssueAttachmentTool",
}