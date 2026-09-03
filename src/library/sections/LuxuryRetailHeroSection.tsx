import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getAggregateRating,
  Image,
  isDarkColor,
  MaybeRTF,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type StyledImageValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, HoursStatus, type HoursType } from "@yext/pages-components";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor;
};

type HeroImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type HoursStatusStyles = {
  showCurrentStatus: boolean;
  timeFormat: "12h" | "24h";
  dayOfWeekFormat: "short" | "long";
  showDayNames: boolean;
};

type RatingSummaryProps = {
  visible: boolean;
};

type LuxuryRetailHeroSectionProps = {
  heading: StyledTextProps;
  subheading: StyledTextProps;
  body: StyledRtfProps;
  heroImage: HeroImageProps;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStatusStyles;
  ratingSummary: RatingSummaryProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

type VisualEditorImageValue = NonNullable<React.ComponentProps<typeof Image>["image"]>;

const LuxuryRetailHeroSectionFields: YextFields<LuxuryRetailHeroSectionProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  hours: {
    type: "entityField",
    label: "Hours",
    filter: {
      types: ["type.hours"],
    },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: "Hours Styles",
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: "Show Current Status",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      timeFormat: {
        label: "Time Format",
        type: "select",
        options: [
          { label: "12 Hour", value: "12h" },
          { label: "24 Hour", value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: "Day Of Week Format",
        type: "select",
        options: [
          { label: "Short", value: "short" },
          { label: "Long", value: "long" },
        ],
      },
      showDayNames: {
        label: "Show Day Names",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  subheading: {
    label: "Subheading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  body: {
    label: "Body",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: {
          types: ["type.rich_text_v2"],
        },
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  heroImage: {
    label: "Hero Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      },
      aspectRatio: {
        label: "Aspect Ratio",
        type: "number",
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select",
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
      styles: {
        label: "Image Styles",
        type: "styledImage",
      },
    },
  },
  primaryCta: {
    label: "Primary CTA",
    type: "comprehensiveCTA",
  },
  secondaryCta: {
    label: "Secondary CTA",
    type: "comprehensiveCTA",
  },
  ratingSummary: {
    label: "Rating Summary",
    type: "object",
    objectFields: {
      visible: {
        label: "Visible",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
};

const resolveThemeColorCssValue = (color?: ThemeColor): string | undefined => {
  if (!color?.selectedColor || color.selectedColor === "default") {
    return undefined;
  }

  switch (color?.selectedColor) {
    case "palette-primary":
      return "var(--colors-palette-primary)";
    case "palette-secondary":
      return "var(--colors-palette-secondary)";
    case "palette-tertiary":
      return "var(--colors-palette-tertiary)";
    case "palette-quaternary":
      return "var(--colors-palette-quaternary)";
    case "palette-primary-light":
      return "hsl(from var(--colors-palette-primary) h s 98)";
    case "palette-secondary-light":
      return "hsl(from var(--colors-palette-secondary) h s 98)";
    case "palette-tertiary-light":
      return "hsl(from var(--colors-palette-tertiary) h s 98)";
    case "palette-quaternary-light":
      return "hsl(from var(--colors-palette-quaternary) h s 98)";
    case "palette-primary-dark":
      return "hsl(from var(--colors-palette-primary) h s 20)";
    case "palette-secondary-dark":
      return "hsl(from var(--colors-palette-secondary) h s 20)";
    case "white":
      return "#FFFFFF";
    case "black":
      return "#000000";
    default:
      return color?.selectedColor;
  }
};

const resolveTextStyles = (styles: StyledTextValue): React.CSSProperties => ({
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const resolveReadableTextColor = (
  fontColor: ThemeColor | undefined,
  backgroundColor: ThemeColor,
  streamDocument: Record<string, unknown>,
): string | undefined => {
  const explicitFontColor = resolveThemeColorCssValue(fontColor);
  if (explicitFontColor) {
    return explicitFontColor;
  }

  if (isDarkColor(backgroundColor, streamDocument)) {
    return "#FFFFFF";
  }

  return "#000000";
};

const resolveReadableThemeColor = (
  color: ThemeColor | undefined,
  backgroundColor: ThemeColor,
  streamDocument: Record<string, unknown>,
  variant?: ComprehensiveCTAValue["styles"]["variant"],
): ThemeColor => {
  const backgroundIsDark = isDarkColor(backgroundColor, streamDocument);
  if (variant === "secondary" && backgroundIsDark) {
    return {
      selectedColor: "white",
      contrastingColor: backgroundColor.selectedColor,
    };
  }

  if (color && resolveThemeColorCssValue(color)) {
    return color;
  }

  return {
    selectedColor: backgroundIsDark ? "white" : "black",
    contrastingColor: backgroundColor.selectedColor,
  };
};

const hasImageSource = (image: unknown): image is VisualEditorImageValue => {
  if (!image || typeof image !== "object") {
    return false;
  }

  if ("url" in image && typeof image.url === "string" && image.url.trim()) {
    return true;
  }

  if (!("image" in image)) {
    return false;
  }

  const nestedImage = image.image;

  if (!nestedImage || typeof nestedImage !== "object") {
    return false;
  }

  return (
    "url" in nestedImage &&
    typeof nestedImage.url === "string" &&
    Boolean(nestedImage.url.trim())
  );
};

const heroCss = `
  .luxury-hero :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-hero :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-hero :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-hero :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-hero :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-hero :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-hero :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-hero :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-hero :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-hero {
    width: 100%;
  }

  .luxury-hero__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.38fr) minmax(0, 1fr);
    align-items: center;
  }

  .luxury-hero__image-shell {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    max-height: min(760px, calc(100vh - 96px));
    overflow: hidden;
    line-height: 0;
  }

  .luxury-hero__image-shell > *,
  .luxury-hero__image-shell [data-entity-field],
  .luxury-hero__image-shell div,
  .luxury-hero__image-shell picture,
  .luxury-hero__image-shell img {
    display: block;
    width: 100%;
  }

  .luxury-hero__image-shell--has-ratio > *,
  .luxury-hero__image-shell--has-ratio [data-entity-field],
  .luxury-hero__image-shell--has-ratio div,
  .luxury-hero__image-shell--has-ratio picture,
  .luxury-hero__image-shell--has-ratio img {
    height: 100%;
  }

  .luxury-hero__image-shell img {
    object-position: center;
  }

  .luxury-hero__image-shell--fixed img {
    object-fit: contain;
  }

  .luxury-hero__inner--text-only {
    grid-template-columns: 1fr;
  }

  .luxury-hero__inner--text-only .luxury-hero__panel {
    min-height: 420px;
  }

  .luxury-hero__inner--text-only .luxury-hero__content {
    max-width: 760px;
  }

  .luxury-hero__panel {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 48px;
  }

  .luxury-hero__content {
    max-width: 560px;
    text-align: center;
  }

  .luxury-hero__status {
    margin: 0 0 16px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .luxury-hero__heading {
    margin: 0;
    font-family: var(--fontFamily-h1-fontFamily, Georgia, serif);
    font-size: clamp(52px, 4.2vw, 78px);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.01em;
  }

  .luxury-hero__subheading {
    margin: 0 0 24px;
    font-family: var(--fontFamily-h2-fontFamily, Georgia, serif);
    font-size: clamp(52px, 4.2vw, 78px);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.01em;
  }

  .luxury-hero__rating {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 24px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .luxury-hero__rating--after-heading {
    margin-top: 24px;
  }

  .luxury-hero__body {
    font-size: 18px;
    line-height: 1.6;
  }

  .luxury-hero__body p {
    margin: 0;
  }

  .luxury-hero__ctas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-top: 32px;
  }

  .luxury-hero__cta {
    display: inline-flex;
    align-items: center;
    position: relative;
    text-decoration: none;
    transition: transform 0.18s ease;
  }

  .luxury-hero__cta--button {
    justify-content: center;
    min-height: 48px;
    padding: 0 24px;
  }

  .luxury-hero__cta--underlined {
    gap: 8px;
    padding: 8px 12px 8px 0;
  }

  .luxury-hero__cta--underlined::after {
    content: "";
    position: absolute;
    left: 0;
    right: 12px;
    bottom: 2px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0.42);
    transform-origin: left center;
    opacity: 0.55;
    transition: transform 0.18s ease, opacity 0.18s ease;
  }

  .luxury-hero__cta--underlined:hover,
  .luxury-hero__cta--underlined:focus-visible {
    transform: translateX(4px);
  }

  .luxury-hero__cta--underlined:hover::after,
  .luxury-hero__cta--underlined:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  .luxury-hero__status .HoursStatus {
    min-height: 0;
  }

  @media (max-width: 1100px) {
    .luxury-hero__inner {
      width: calc(100vw - 40px);
      grid-template-columns: 1fr;
    }

    .luxury-hero__image-shell {
      min-height: 280px;
      max-height: 360px;
    }

    .luxury-hero__panel {
      padding: 48px 28px;
    }
  }

  @media (max-width: 720px) {
    .luxury-hero__image-shell {
      min-height: 220px;
      max-height: 280px;
    }

    .luxury-hero__panel {
      padding-left: 0;
      padding-right: 0;
    }

    .luxury-hero__heading,
    .luxury-hero__subheading {
      font-size: clamp(38px, 11vw, 52px);
    }
  }
`;

const LuxuryRetailHeroSectionComponent: PuckComponent<
  LuxuryRetailHeroSectionProps
> = ({ id, puck, ...props }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const liveStreamDocument = useDocument<Record<string, unknown>>();
  const resolvedHeading = resolveComponentData(
    props.heading.text,
    locale,
    liveStreamDocument,
  );
  const resolvedSubheading = resolveComponentData(
    props.subheading.text,
    locale,
    liveStreamDocument,
  );
  const hasSubheading = Boolean(resolvedSubheading);
  const resolvedBody = resolveComponentData(
    props.body.text,
    locale,
    liveStreamDocument,
    {
      richTextStyleOverrides: {
        color: resolveReadableTextColor(
          props.body.fontColor,
          props.section?.backgroundColor,
          liveStreamDocument,
        ),
      },
    },
  );
  const resolvedImage = resolveComponentData(
    props.heroImage.image,
    locale,
    liveStreamDocument,
  );
  const hasHeroImage = hasImageSource(resolvedImage);
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    liveStreamDocument,
  );
  const heroImageBorderRadius =
    props.heroImage.styles.borderRadius === "default"
      ? undefined
      : props.heroImage.styles.borderRadius;
  const heroImageHasAspectRatio = props.heroImage.aspectRatio > 0;
  const heroImageShellStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: heroImageHasAspectRatio
      ? props.heroImage.aspectRatio
      : undefined,
    borderRadius: heroImageBorderRadius,
    overflow:
      props.heroImage.imageConstrain === "filled" ||
      Boolean(heroImageBorderRadius)
        ? "hidden"
        : undefined,
  };
  const heroImageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: heroImageHasAspectRatio ? "100%" : "auto",
    objectFit: props.heroImage.imageConstrain === "filled" ? "cover" : "contain",
    objectPosition: "center",
  };
  let resolvedBodyContent: React.ReactNode;

  if (React.isValidElement(resolvedBody)) {
    resolvedBodyContent = resolvedBody;
  } else {
    resolvedBodyContent = (
      <MaybeRTF
        data={
          resolvedBody as
            | string
            | {
                html?: string;
                json?: string;
              }
            | undefined
        }
        richTextStyleOverrides={{
          color: resolveReadableTextColor(
            props.body.fontColor,
            props.section?.backgroundColor,
            liveStreamDocument,
          ),
        }}
      />
    );
  }
  const { averageRating, reviewCount } = getAggregateRating(liveStreamDocument);
  const headingColor = resolveReadableTextColor(
    props.heading.fontColor,
    props.section?.backgroundColor,
    liveStreamDocument,
  );
  const bodyColor = resolveReadableTextColor(
    props.body.fontColor,
    props.section?.backgroundColor,
    liveStreamDocument,
  );
  const subheadingColor = resolveReadableTextColor(
    props.subheading.fontColor,
    props.section?.backgroundColor,
    liveStreamDocument,
  );
  const getCtaClassName = (variant: ComprehensiveCTAValue["styles"]["variant"]) =>
    `luxury-hero__cta ${
      variant === "link"
        ? "luxury-hero__cta--underlined"
        : "luxury-hero__cta--button"
    }`;
  const primaryCtaColor = resolveReadableThemeColor(
    props.primaryCta.styles.color,
    props.section.backgroundColor,
    liveStreamDocument,
    props.primaryCta.styles.variant,
  );
  const secondaryCtaColor = resolveReadableThemeColor(
    props.secondaryCta.styles.color,
    props.section.backgroundColor,
    liveStreamDocument,
    props.secondaryCta.styles.variant,
  );

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailHeroSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={puck.isEditing}
      >
        <style>{heroCss}</style>
        <section
          className="luxury-hero"
          style={{
            backgroundColor: resolveThemeColorCssValue(props.section?.backgroundColor),
          }}
        >
          <div
            className={`luxury-hero__inner${hasHeroImage ? "" : " luxury-hero__inner--text-only"}`}
          >
          {hasHeroImage ? (
            <div
              className={`luxury-hero__image-shell luxury-hero__image-shell--${props.heroImage.imageConstrain}${
                heroImageHasAspectRatio ? " luxury-hero__image-shell--has-ratio" : ""
              }`}
              style={{
                ...heroImageShellStyle,
                backgroundColor: resolveThemeColorCssValue(
                  props.section?.backgroundColor,
                ),
                borderRadius: heroImageBorderRadius,
              }}
            >
              <EntityField
                displayName="Hero Image"
                fieldId={props.heroImage.image.field}
                constantValueEnabled={props.heroImage.image.constantValueEnabled}
              >
                <Image
                  image={resolvedImage}
                  className={`luxury-hero__image luxury-hero__image--${props.heroImage.imageConstrain}`}
                  style={heroImageStyle}
                />
              </EntityField>
            </div>
          ) : null}
          <div
            className="luxury-hero__panel"
          >
            <div className="luxury-hero__content">
              <div
                className="luxury-hero__status"
                style={{ color: bodyColor }}
              >
                <EntityField
                  displayName="Hours"
                  fieldId={props.hours.field}
                  constantValueEnabled={props.hours.constantValueEnabled}
                >
                  {resolvedHours && props.hoursStyles.showCurrentStatus ? (
                    <HoursStatus
                      hours={resolvedHours}
                      timezone={
                        typeof liveStreamDocument.timezone === "string"
                          ? liveStreamDocument.timezone
                          : Intl.DateTimeFormat().resolvedOptions().timeZone
                      }
                      comingSoon={Boolean(liveStreamDocument.comingSoon)}
                      currentTemplate={(status) => (
                        <span>{status.isOpen ? "Open Now" : "Closed Now"}</span>
                      )}
                      separatorTemplate={() => <span>: </span>}
                      futureTemplate={(status) => (
                        <span>{status.isOpen ? "Closes at" : "Opens at"}</span>
                      )}
                      dayOfWeekTemplate={(status) =>
                        props.hoursStyles.showDayNames ? (
                          <span>
                            {" "}
                            {status.isOpen
                              ? status.currentInterval?.end
                                  ?.setLocale(locale)
                                  .toLocaleString({
                                    weekday:
                                      props.hoursStyles.dayOfWeekFormat === "short"
                                        ? "short"
                                        : "long",
                                  })
                              : status.futureInterval?.start
                                  ?.setLocale(locale)
                                  .toLocaleString({
                                    weekday:
                                      props.hoursStyles.dayOfWeekFormat === "short"
                                        ? "short"
                                        : "long",
                                  })}
                          </span>
                        ) : null
                      }
                      timeOptions={{
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: props.hoursStyles.timeFormat === "12h",
                      }}
                    />
                  ) : null}
                </EntityField>
              </div>

              <EntityField
                displayName="Heading"
                fieldId={props.heading.text.field}
                constantValueEnabled={props.heading.text.constantValueEnabled}
              >
                <h1
                  className="luxury-hero__heading"
                  style={{
                    ...resolveTextStyles(props.heading.styles),
                    color: headingColor,
                  }}
                >
                  {resolvedHeading}
                </h1>
              </EntityField>

              {hasSubheading ? (
                <EntityField
                  displayName="Subheading"
                  fieldId={props.subheading.text.field}
                  constantValueEnabled={
                    props.subheading.text.constantValueEnabled
                  }
                >
                  <h2
                    className="luxury-hero__subheading"
                    style={{
                      ...resolveTextStyles(props.subheading.styles),
                      color: subheadingColor,
                    }}
                  >
                    {resolvedSubheading}
                  </h2>
                </EntityField>
              ) : null}

              {props.ratingSummary.visible &&
              typeof averageRating === "number" &&
              typeof reviewCount === "number" &&
              reviewCount > 0 ? (
                <p
                  className={`luxury-hero__rating${hasSubheading ? "" : " luxury-hero__rating--after-heading"}`}
                  aria-label="Store details"
                  style={{ color: bodyColor }}
                >
                  <FaStar aria-hidden="true" />
                  {averageRating.toFixed(1)} stars from {reviewCount} customer
                  reviews
                </p>
              ) : null}

              <EntityField
                displayName="Body"
                fieldId={props.body.text.field}
                constantValueEnabled={props.body.text.constantValueEnabled}
              >
                <div className="luxury-hero__body">
                  {resolvedBodyContent}
                </div>
              </EntityField>

              <div className="luxury-hero__ctas">
                <EntityField
                  displayName="Primary Call to Action"
                  fieldId={props.primaryCta.data.cta.field}
                  constantValueEnabled={
                    props.primaryCta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={{
                      data: props.primaryCta.data,
                      styles: {
                        ...props.primaryCta.styles,
                        color: primaryCtaColor,
                      },
                      eventName: props.primaryCta.eventName,
                    }}
                    className={getCtaClassName(props.primaryCta.styles.variant)}
                  />
                </EntityField>
                <EntityField
                  displayName="Secondary Call to Action"
                  fieldId={props.secondaryCta.data.cta.field}
                  constantValueEnabled={
                    props.secondaryCta.data.cta.constantValueEnabled
                  }
                >
                  <ComprehensiveCTA
                    value={{
                      data: props.secondaryCta.data,
                      styles: {
                        ...props.secondaryCta.styles,
                        color: secondaryCtaColor,
                      },
                      eventName: props.secondaryCta.eventName,
                    }}
                    className={getCtaClassName(props.secondaryCta.styles.variant)}
                  />
                </EntityField>
              </div>
            </div>
          </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailHeroSection: YextComponentConfig<LuxuryRetailHeroSectionProps> =
  {
    label: "Hero Section",
    fields: LuxuryRetailHeroSectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
          },
          constantValueEnabled: false,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      subheading: {
        text: {
          field: "geomodifier",
          constantValue: {
            defaultValue: "",
          },
          constantValueEnabled: false,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      body: {
        text: {
          field: "",
          constantValue: {
            defaultValue: getDefaultRTF(
              "Northline Apparel - Lincoln Park is a clothing retail location offering a curated selection of contemporary apparel, premium denim, and seasonal essentials for men, women and children. Experience personalized styling services and an unmatched collection of designer-inspired fashion in the heart of Chicago.",
            ),
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        fontColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      heroImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 1.5,
        imageConstrain: "filled",
        styles: {
          borderRadius: "default",
        },
      },
      primaryCta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "Get Directions",
              },
              link: {
                defaultValue: "#",
              },
              linkType: "URL",
            },
            constantValueEnabled: true,
            selectedType: "textAndLink",
          },
          openInNewTab: false,
        },
        styles: {
          variant: "primary",
          color: undefined,
          button: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            borderRadius: "999px",
            letterSpacing: "default",
          },
        },
        eventName: "primaryCta",
      },
      secondaryCta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "Book Personal Stylist",
              },
              link: {
                defaultValue: "#",
              },
              linkType: "URL",
            },
            constantValueEnabled: true,
            selectedType: "textAndLink",
          },
          openInNewTab: false,
        },
        styles: {
          variant: "secondary",
          color: undefined,
          button: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
            borderRadius: "999px",
            letterSpacing: "default",
          },
        },
        eventName: "secondaryCta",
      },
      hours: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: false,
      },
      hoursStyles: {
        showCurrentStatus: true,
        timeFormat: "12h",
        dayOfWeekFormat: "long",
        showDayNames: false,
      },
      ratingSummary: {
        visible: true,
      },
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        visibleOnLivePage: true,
      },
    },
    render: (props) => <LuxuryRetailHeroSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailHeroSection",
  displayName: "Hero Section",
  description: "Hero Section",
  pageSetTypes: ["ENTITY"],
};
