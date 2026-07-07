import { useTranslations } from "next-intl";
import { useCallback } from "react";

export type ValidationTranslator = (
  key: string,
  values?: Record<string, unknown>,
) => string;

export function useValidationTranslator(): ValidationTranslator {
  const t = useTranslations("forms.validation");
  return useCallback((key, values) => t(key as never, values as never), [t]);
}
