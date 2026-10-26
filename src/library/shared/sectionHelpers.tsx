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

/** Read the selected surface itself; saved contrast metadata can be stale or colored. */
export const getReadableTextColor = (
  fontColor: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
): string =>
  getThemeColorCssValue(fontColor) ??
  getThemeColorCssValue(
    getDefaultForegroundColor(
      hasExplicitThemeColor(backgroundColor)
        ? backgroundColor.selectedColor
        : "white",
      streamDocument,
    ),
  ) ??
  "black";

export const getSurfaceColorStyle = (
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
): React.CSSProperties => ({
  backgroundColor: getThemeColorCssValue(backgroundColor),
  color: getReadableTextColor(undefined, backgroundColor, streamDocument),
});

export const getReadableThemeColor = (
  color: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
  variant?: ComprehensiveCTAValue["styles"]["variant"],
): ThemeColor | undefined => {
  if (hasExplicitThemeColor(color)) {
    return color;
  }
  // Buttons use the platform's Theme variants; default links follow the surface.
  return variant === "link" || variant === "secondary"
    ? {
        selectedColor: getReadableTextColor(
          undefined,
          backgroundColor,
          streamDocument,
        ),
        contrastingColor: backgroundColor?.selectedColor ?? "white",
      }
    : undefined;
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
  !value || value === "default"
    ? "var(--borderRadius-image-borderRadius)"
    : value;

/** getDefaultRTF adds a paragraph style that is not an authored text style.
 * Strip only that generated signature. Inline span styles and edited paragraphs
 * remain intact, including deliberately authored rich-text colors. */
export const cleanGeneratedRichTextStyles = (html: string): string => {
  const cleaned = html.replace(
    /(<p\b[^>]*?) style="font-size: 14\.67px; font-weight: 400; line-height: 18\.67px; (?:color: rgb\(0, 0, 0\); )?margin: 0; padding: 3px 2px 3px 2px; position: relative;"/g,
    "$1",
  );
  // MaybeRTF supplies Theme rules with !important. Preserve authored inline
  // values in variables so our scoped rules can restore them at that priority.
  return cleaned.replace(
    /\bstyle=(?:"([^"]*)"|'([^']*)')/g,
    (_, doubleQuoted: string | undefined, singleQuoted: string | undefined) => {
      const quote = doubleQuoted === undefined ? "'" : '"';
      const declarations = doubleQuoted ?? singleQuoted ?? "";
      const authoredStyles = Array.from(
        declarations.matchAll(
          /(?:^|;)\s*(color|font-family|font-size|font-weight|font-style|text-transform|letter-spacing)\s*:\s*([^;]+)/g,
        ),
        ([, property, value]) =>
          `--luxury-retail-rtf-${property}: ${value.replace(/\s*!important\s*$/, "")}`,
      );
      return `style=${quote}${declarations}; ${authoredStyles.join("; ")}${quote}`;
    },
  );
};

export const renderResolvedRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
): React.ReactNode => {
  const textStyles = getTextStyles({
    fontFamily: "default",
    fontSize: "default",
    fontWeight: "default",
    fontStyle: "default",
    textTransform: "default",
    ...richTextStyleOverrides,
  });
  const color = richTextStyleOverrides?.color;
  const style = {
    ...textStyles,
    ...Object.fromEntries(
      Object.entries(textStyles)
        .filter(([, value]) => value !== undefined)
        .map(([property, value]) => [
          `--luxury-retail-body-${property}`,
          value,
        ]),
    ),
    color: typeof color === "object" ? getThemeColorCssValue(color) : color,
  };

  if (React.isValidElement<MaybeRTFProps>(value) && value.type === MaybeRTF) {
    return renderResolvedRichText(value.props.data, {
      ...value.props.richTextStyleOverrides,
      ...richTextStyleOverrides,
    });
  }

  if (
    React.isValidElement<{
      className?: string;
      style?: React.CSSProperties;
      children?: React.ReactNode;
    }>(value)
  ) {
    // resolveComponentData wraps MaybeRTF. Forward overrides to its child;
    // the scoped typography rules preserve authored inline styles.
    return React.cloneElement(value, {
      className: value.props.className?.replace(
        /\brtf-(?:theme|wrapper)\b/g,
        "",
      ),
      style: { ...value.props.style, ...style },
      children: React.Children.map(value.props.children, (child) =>
        renderResolvedRichText(child, richTextStyleOverrides),
      ),
    });
  }

  if (typeof value === "object" && value !== null && "html" in value) {
    return (
      <MaybeRTF
        data={{
          ...(value as RichText),
          html: cleanGeneratedRichTextStyles(String(value.html ?? "")),
        }}
        className="luxury-retail-rich-text"
        style={style}
        richTextStyleOverrides={richTextStyleOverrides}
      />
    );
  }

  return typeof value === "string" ? (
    <div className="luxury-retail-rich-text" style={style}>
      {value}
    </div>
  ) : null;
};
