type TemplateValue = string | number | null | undefined;

export const resolveTemplate = (
  content: string,
  values: Record<string, TemplateValue>
) => {
  return content.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    const value = values[key];
    return value === null || value === undefined || value === '' ? match : String(value);
  });
};

