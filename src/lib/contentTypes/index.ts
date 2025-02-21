import { defaultFileConfig, type FileConfig } from "./config";

// Direct exports of computed constants
export type SupportedContentTypes = {
  [K in keyof typeof defaultFileConfig]: (typeof defaultFileConfig)[K]["extensions"];
};

export const SUPPORTED_CONTENT_TYPES = Object.entries(defaultFileConfig).reduce(
  (acc, [contentType, value]) => ({
    ...acc,
    [contentType]: value.extensions,
  }),
  {} as SupportedContentTypes
);

export const SUPPORTED_MIME_TYPES = Object.keys(
  SUPPORTED_CONTENT_TYPES
) as readonly string[];

export const SUPPORTED_EXTENSIONS = Object.values(
  SUPPORTED_CONTENT_TYPES
).flatMap((type) => type) as readonly string[];

// Direct exports of utility functions
export const getDefaultExtension = (contentType: keyof FileConfig) =>
  SUPPORTED_CONTENT_TYPES[contentType][0];

export const isValidContentType = (file: File) =>
  SUPPORTED_MIME_TYPES.includes(file.type as keyof FileConfig);

export const isValidExtension = (extension: string) =>
  SUPPORTED_EXTENSIONS.includes(extension);

export const createDocumentLoader = (extension: string, filePath: string) => {
  const fileConfig = Object.values(defaultFileConfig).find((type) =>
    type.extensions.some((ext) => ext === extension)
  );

  if (!fileConfig) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  return new fileConfig.loader(filePath);
};

// Export types
export type ContentType = keyof FileConfig;
export type FileExtension = FileConfig[ContentType]["extensions"][number];
