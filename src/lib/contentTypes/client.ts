export const SUPPORTED_CONTENT_TYPES = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt", ".text"],
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
    ".doc",
  ],
  "application/json": [".json", ".jsonld"],
  "text/markdown": [".md", ".markdown", ".mdown", ".mkd"],
} as const;

export const displayExtensions = Object.values(SUPPORTED_CONTENT_TYPES).map(
  (type) => type[0].slice(1)
);

// Export types
export type SupportedContentTypes = typeof SUPPORTED_CONTENT_TYPES;
export type ContentType = keyof SupportedContentTypes;
export type FileExtension = SupportedContentTypes[ContentType][number];

// Direct exports of utility functions
export const getDefaultExtension = (contentType: ContentType) =>
  SUPPORTED_CONTENT_TYPES[contentType][0];
