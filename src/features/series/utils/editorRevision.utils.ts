export type RevisionField = 'synopsis' | 'genre' | 'name' | 'budget' | 'cover';

export type ChecklistItemId = 'synopsis' | 'genre' | 'name' | 'budget';

const CHECKLIST_ID_TO_FIELD: Record<ChecklistItemId, RevisionField> = {
  synopsis: 'synopsis',
  genre: 'genre',
  name: 'name',
  budget: 'budget',
};

export const CHECKLIST_LABELS: Record<ChecklistItemId, string> = {
  synopsis: 'Nội dung tóm tắt rõ ràng, hấp dẫn',
  genre: 'Thể loại phù hợp thị trường mục tiêu',
  name: 'Phác thảo (Name) đạt chất lượng cơ bản',
  budget: 'Ngân sách yêu cầu hợp lý',
};

export const REVISION_FIELD_LABELS: Record<RevisionField, string> = {
  synopsis: 'Tóm tắt nội dung',
  genre: 'Thể loại',
  name: 'Bản phác thảo (Name)',
  budget: 'Ngân sách / Vốn yêu cầu',
  cover: 'Ảnh bìa',
};

const CHECKLIST_META_PREFIX = /^\[CHECKLIST:([^\]]*)\]\s*\n?/;

const stripChecklistMeta = (editorNote: string): { checklistIds: ChecklistItemId[]; body: string } => {
  const match = editorNote.match(CHECKLIST_META_PREFIX);
  if (!match) return { checklistIds: [], body: editorNote };

  const checklistIds = match[1]
    .split(',')
    .map((id) => id.trim())
    .filter((id): id is ChecklistItemId => id in CHECKLIST_ID_TO_FIELD);

  return {
    checklistIds,
    body: editorNote.replace(CHECKLIST_META_PREFIX, ''),
  };
};

/** Parse editor note into structured revision feedback for Mangaka UI */
export function parseEditorRevisionNote(editorNote: string): {
  bulletLines: string[];
  affectedFields: RevisionField[];
  checklistIds: ChecklistItemId[];
  displayNote: string;
  editorComment: string;
  suggestedBudgetText: string | null;
} {
  const { checklistIds, body } = stripChecklistMeta(editorNote);
  const lines = body.split('\n').map((l) => l.trimEnd());

  const bulletLines = lines
    .map((l) => l.trim())
    .filter((l) => /^[•\-*]/.test(l))
    .map((l) => l.replace(/^[•\-*]\s*/, ''));

  const suggestedBudgetLine = lines.find((l) => /Ngân sách đề xuất/i.test(l)) ?? null;

  const commentStart = lines.findIndex((l) => l.trim() === 'Nhận xét của Editor:');
  let editorComment = '';
  if (commentStart >= 0) {
    editorComment = lines
      .slice(commentStart + 1)
      .filter((l) => !/Ngân sách đề xuất/i.test(l))
      .join('\n')
      .trim();
  } else if (bulletLines.length === 0) {
    editorComment = body.trim();
  }

  const fromChecklist = checklistIds
    .map((id) => CHECKLIST_ID_TO_FIELD[id])
    .filter(Boolean);

  const fromBullets = bulletLines
    .map((line) => {
      const entry = Object.entries(CHECKLIST_LABELS).find(([, label]) => line.includes(label) || label.includes(line));
      return entry ? CHECKLIST_ID_TO_FIELD[entry[0] as ChecklistItemId] : null;
    })
    .filter((field): field is RevisionField => field != null);

  // Chỉ dùng metadata/bullet từ editor — không quét keyword trong nhận xét (tránh báo nhầm mục đã đạt)
  const affectedFields = [...new Set([...fromChecklist, ...fromBullets])];

  const displayNote = body.trim();

  return {
    bulletLines,
    affectedFields,
    checklistIds,
    displayNote,
    editorComment,
    suggestedBudgetText: suggestedBudgetLine,
  };
}

export function extractSuggestedBudgetFromNote(editorNote: string): number | null {
  const match = editorNote.match(/Ngân sách đề xuất[^:]*:\s*([\d.,]+)\s*VND/i);
  if (!match?.[1]) return null;
  const numeric = match[1].replace(/[^0-9]/g, '');
  return numeric ? Number(numeric) : null;
}
