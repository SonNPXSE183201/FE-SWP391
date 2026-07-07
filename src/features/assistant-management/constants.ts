export const ASSISTANT_MANAGEMENT_PATH = '/mangaka/assistants';

export const buildAssistantManagementUrl = (seriesId?: string) => {
  const params = new URLSearchParams();
  params.set('tab', 'directory');
  if (seriesId) params.set('seriesId', seriesId);
  const query = params.toString();
  return query ? `${ASSISTANT_MANAGEMENT_PATH}?${query}` : `${ASSISTANT_MANAGEMENT_PATH}?tab=directory`;
};
