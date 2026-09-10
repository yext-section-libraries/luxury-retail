import * as React from "react";
import {
  MaybeRTF,
  getDefaultForegroundColor,
  getThemeColorCssValue,
  type ComprehensiveCTAValue,
  type MaybeRTFProps,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
} from "@yext/visual-editor";

export { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
export { getThemeColorCssValue };

export type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

export type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor;
};

type TextStyles = Pick<
  StyledTextValue,
  "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "textTransform"
> & { letterSpacing?: string };

export const getTextStyles = (
  styles: TextStyles,
  color?: ThemeColor,
  fallbackColor?: string,
): React.CSSProperties => ({
  color: getThemeColorCssValue(color) ?? fallbackColor,
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
  letterSpacing:
    !styles.letterSpacing || styles.letterSpacing === "default"
      ? undefined
      : styles.letterSpacing,
});

export const hasExplicitThemeColor = (
  color?: ThemeColor,
): color is ThemeColor =>
  Boolean(color?.selectedColor && color.selectedColor !== "default");

const defaultSurfaceColor: ThemeColor = {
  selectedColor: "white",
  contrastingColor: "palette-quaternary",
};

export const getReadableTextColor = (
  fontColor: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
): string =>
  getThemeColorCssValue(fontColor) ??
  getThemeColorCssValue(
    getDefaultForegroundColor(
      backgroundColor ?? defaultSurfaceColor,
      streamDocument,
    ),
  ) ??
  "#000000";

export const getReadableThemeColor = (
  color: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
  variant?: ComprehensiveCTAValue["styles"]["variant"],
): ThemeColor => {
  const surfaceColor = backgroundColor ?? defaultSurfaceColor;
  const foregroundColor =
    getDefaultForegroundColor(surfaceColor, streamDocument) ?? {
      selectedColor: "black",
      contrastingColor: surfaceColor.selectedColor,
    };

  if (
    variant === "secondary" &&
    foregroundColor.selectedColor === "white"
  ) {
    return foregroundColor;
  }

  return color && getThemeColorCssValue(color) ? color : foregroundColor;
};

export const hasImageSource = (
  image: unknown,
): image is { url?: string; image?: { url?: string } | null } => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string") {
    return image.url.trim().length > 0;
  }

  return Boolean(
    "image" in image &&
      image.image &&
      typeof image.image === "object" &&
      "url" in image.image &&
      typeof image.image.url === "string" &&
      image.image.url.trim(),
  );
};

export const resolveBorderRadius = (value?: string): string | undefined =>
  !value || value === "default" ? undefined : value;

export const renderResolvedRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  if (React.isValidElement(value)) {
    if (!richTextStyleOverrides) {
      return value;
    }

    return React.cloneElement(
      value as React.ReactElement<{ style?: React.CSSProperties }>,
      {
        style: {
          ...(value.props as { style?: React.CSSProperties }).style,
          ...richTextStyleOverrides,
          color: getThemeColorCssValue(richTextStyleOverrides.color),
        },
      },
    );
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;

  return (
    <MaybeRTF
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};
