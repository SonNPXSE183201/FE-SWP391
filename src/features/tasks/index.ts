// Tasks feature — barrel export

// API
export { taskApi } from './api/task.api';
export type { CreateTaskRequest, SubmitTaskResultRequest, RequestExtensionRequest } from './api/task.api';

// Components
export { CreateTaskModal } from './components/CreateTaskModal';

// Constants
export { TASK_STATUS_CONFIG, TASK_STATUS_FILTER_OPTIONS, formatDeadline } from './constants';

// Mock data (temporary — remove when backend API is ready)
export { MOCK_TASKS } from './data/mockData';
export type { MockTask } from './data/mockData';
