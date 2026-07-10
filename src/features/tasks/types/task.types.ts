/** Frontend-only: submit flow uploads File trước khi gửi SubmitTaskDto lên API */
export interface SubmitTaskWithFile {
  taskId: string;
  image: File;
  comment?: string;
}
