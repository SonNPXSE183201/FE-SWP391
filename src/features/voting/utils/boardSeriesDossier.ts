export const hasBoardSeriesDossier = (series: {
  resourceFolderUrl?: string | null;
  editorNote?: string | null;
  mangakaSubmissionNote?: string | null;
}): boolean =>
  Boolean(
    series.resourceFolderUrl?.trim() ||
      series.editorNote?.trim() ||
      series.mangakaSubmissionNote?.trim(),
  );
