import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  EntityField,
  Image,
  getAnalyticsScopeHash,
  getDefaultRTF,
  isDarkColor,
  resolveComponentData,
  useDocument,
  MaybeRTF,
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
import { AnalyticsScopeProvider } from "@yext/pages-components";
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

type PromoImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type LuxuryRetailSeasonalPromoSectionProps = {
  heading: StyledTextProps;
  body: StyledRtfProps;
  cta: ComprehensiveCTAValue;
  promoImage: PromoImageProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

type VisualEditorImageValue = NonNullable<React.ComponentProps<typeof Image>["image"]>;

const LuxuryRetailSeasonalPromoSectionFields: YextFields<
  LuxuryRetailSeasonalPromoSectionProps
> = {
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
  heading: {
    label: "Heading",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
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
        filter: { types: ["type.rich_text_v2"] },
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  cta: {
    label: "CTA",
    type: "comprehensiveCTA",
  },
  promoImage: {
    label: "Promo Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
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

const resolveReadableTextColor = (
  fontColor: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
): string => {
  return (
    resolveThemeColorCssValue(fontColor) ??
    (isDarkColor(
      backgroundColor ?? {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
      streamDocument,
    )
      ? "#FFFFFF"
      : "#000000")
  );
};

const resolveReadableThemeColor = (
  color: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
  variant?: ComprehensiveCTAValue["styles"]["variant"],
): ThemeColor => {
  const resolvedBackgroundColor = backgroundColor ?? {
    selectedColor: "white",
    contrastingColor: "palette-quaternary",
  };
  const backgroundIsDark = isDarkColor(resolvedBackgroundColor, streamDocument);

  if (variant === "secondary" && backgroundIsDark) {
    return {
      selectedColor: "white",
      contrastingColor: resolvedBackgroundColor.selectedColor,
    };
  }

  if (color && resolveThemeColorCssValue(color)) {
    return color;
  }

  return {
    selectedColor: backgroundIsDark ? "white" : "black",
    contrastingColor: resolvedBackgroundColor.selectedColor,
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

const promoCss = `
  .luxury-seasonal-promo :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-seasonal-promo :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-seasonal-promo :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-seasonal-promo :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-seasonal-promo :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-seasonal-promo :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-seasonal-promo :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-seasonal-promo :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-seasonal-promo :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-seasonal-promo {
    width: 100%;
    margin: 0;
    padding-top: 48px;
  }

  .luxury-seasonal-promo__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
  }

  .luxury-seasonal-promo__content {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    align-items: stretch;
  }

  .luxury-seasonal-promo__copy {
    display: flex;
    align-items: center;
    padding: 48px 40px;
  }

  .luxury-seasonal-promo__copy-inner {
    max-width: 600px;
  }

  .luxury-seasonal-promo__heading {
    margin: 0 0 16px;
    font-family: var(--fontFamily-h2-fontFamily, Georgia, serif);
    font-size: clamp(36px, 3vw, 58px);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.01em;
  }

  .luxury-seasonal-promo__body {
    font-size: 15px;
    line-height: 1.6;
  }

  .luxury-seasonal-promo__body p {
    margin: 0;
  }

  .luxury-seasonal-promo__cta {
    display: inline-flex;
    align-items: center;
    position: relative;
    text-decoration: none;
    transition: transform 0.18s ease;
  }

  .luxury-seasonal-promo__cta--button {
    justify-content: center;
    min-height: 48px;
    margin-top: 24px;
    padding: 0 24px;
  }

  .luxury-seasonal-promo__cta--underlined {
    gap: 8px;
    margin-top: 24px;
    padding: 8px 12px 8px 0;
  }

  .luxury-seasonal-promo__cta--underlined::after {
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

  .luxury-seasonal-promo__cta--underlined:hover,
  .luxury-seasonal-promo__cta--underlined:focus-visible {
    transform: translateX(4px);
  }

  .luxury-seasonal-promo__cta--underlined:hover::after,
  .luxury-seasonal-promo__cta--underlined:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  .luxury-seasonal-promo__image-shell {
    align-self: start;
    overflow: hidden;
  }

  .luxury-seasonal-promo__image-surface {
    padding: 24px;
  }

  .luxury-seasonal-promo__image-frame > *,
  .luxury-seasonal-promo__image-frame [data-entity-field],
  .luxury-seasonal-promo__image-frame div,
  .luxury-seasonal-promo__image-frame picture,
  .luxury-seasonal-promo__image-frame img {
    display: block;
    width: 100%;
    overflow: hidden;
    border-radius: inherit;
  }

  .luxury-seasonal-promo__image-frame--has-ratio > *,
  .luxury-seasonal-promo__image-frame--has-ratio [data-entity-field],
  .luxury-seasonal-promo__image-frame--has-ratio div,
  .luxury-seasonal-promo__image-frame--has-ratio picture,
  .luxury-seasonal-promo__image-frame--has-ratio img {
    height: 100%;
  }

  .luxury-seasonal-promo__content--text-only {
    grid-template-columns: 1fr;
  }

  .luxury-seasonal-promo__content--text-only .luxury-seasonal-promo__copy {
    padding: 56px;
  }

  .luxury-seasonal-promo__content--text-only .luxury-seasonal-promo__copy-inner {
    max-width: 760px;
    margin: 0 auto;
  }

  @media (max-width: 1100px) {
    .luxury-seasonal-promo {
      padding-top: 32px;
    }

    .luxury-seasonal-promo__inner {
      width: calc(100vw - 40px);
    }

    .luxury-seasonal-promo__content {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .luxury-seasonal-promo__copy {
      padding: 0;
    }

    .luxury-seasonal-promo__image-shell {
      max-height: 480px;
    }
  }

  @media (max-width: 720px) {
    .luxury-seasonal-promo__image-surface {
      padding: 16px;
    }

    .luxury-seasonal-promo__image-shell {
      max-height: 360px;
    }
  }
`;

const LuxuryRetailSeasonalPromoSectionComponent: PuckComponent<
  LuxuryRetailSeasonalPromoSectionProps
> = ({ id, ...props }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument<Record<string, unknown>>();
  const imageLocale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";
  const heading = resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const body = resolveComponentData(props.body.text, locale, streamDocument);
  const image = resolveComponentData(props.promoImage.image, imageLocale, streamDocument);
  const hasImage = hasImageSource(image);
  const promoImageHasAspectRatio = props.promoImage.aspectRatio > 0;
  let bodyContent: React.ReactNode;

  if (React.isValidElement(body)) {
    bodyContent = body;
  } else {
    bodyContent = (
      <MaybeRTF
        data={
          body as
            | string
            | {
                html?: string;
                json?: string;
              }
            | undefined
        }
      />
    );
  }
  const readableTextColor = resolveReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const headingStyle: React.CSSProperties = {
    fontFamily:
      props.heading.styles.fontFamily === "default"
        ? undefined
        : props.heading.styles.fontFamily,
    fontSize:
      props.heading.styles.fontSize === "default"
        ? undefined
        : props.heading.styles.fontSize,
    fontWeight:
      props.heading.styles.fontWeight === "default"
        ? undefined
        : props.heading.styles.fontWeight,
    fontStyle:
      props.heading.styles.fontStyle === "default"
        ? undefined
        : props.heading.styles.fontStyle,
    textTransform:
      props.heading.styles.textTransform === "default"
        ? undefined
        : props.heading.styles.textTransform,
    color: resolveThemeColorCssValue(props.heading.fontColor) ?? readableTextColor,
  };
  const bodyStyleOverrides = {
    color: resolveThemeColorCssValue(props.body.fontColor) ?? readableTextColor,
  };
  if (!React.isValidElement(body)) {
    bodyContent = (
      <MaybeRTF
        data={
          body as
            | string
            | {
                html?: string;
                json?: string;
              }
            | undefined
        }
        richTextStyleOverrides={bodyStyleOverrides}
      />
    );
  }
  const ctaClassName = `luxury-seasonal-promo__cta ${
    props.cta.styles.variant === "link"
      ? "luxury-seasonal-promo__cta--underlined"
      : "luxury-seasonal-promo__cta--button"
  }`;
  const ctaColor = resolveReadableThemeColor(
    props.cta.styles.color,
    props.section?.backgroundColor,
    streamDocument,
    props.cta.styles.variant,
  );

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailSeasonalPromoSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{promoCss}</style>
        <section
          className="luxury-seasonal-promo"
          style={{
            backgroundColor: resolveThemeColorCssValue(props.section?.backgroundColor),
          }}
        >
          <div className="luxury-seasonal-promo__inner">
          <div
            className={`luxury-seasonal-promo__content${hasImage ? "" : " luxury-seasonal-promo__content--text-only"}`}
          >
            <div className="luxury-seasonal-promo__copy">
              <div className="luxury-seasonal-promo__copy-inner">
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2 className="luxury-seasonal-promo__heading" style={headingStyle}>
                    {heading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Body"
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div className="luxury-seasonal-promo__body">
                    {bodyContent}
                  </div>
                </EntityField>
                <EntityField
                  displayName="Call to Action"
                  fieldId={props.cta.data.cta.field}
                  constantValueEnabled={props.cta.data.cta.constantValueEnabled}
                >
                  <ComprehensiveCTA
                    value={{
                      data: props.cta.data,
                      styles: {
                        ...props.cta.styles,
                        color: ctaColor,
                      },
                      eventName: props.cta.eventName,
                    }}
                    className={ctaClassName}
                  />
                </EntityField>
              </div>
            </div>
            {hasImage ? (
              <div
                className="luxury-seasonal-promo__image-shell"
                style={
                  {
                    backgroundColor: resolveThemeColorCssValue(
                      props.section?.backgroundColor,
                    ),
                  } as React.CSSProperties
                }
              >
                <div className="luxury-seasonal-promo__image-surface">
                  <EntityField
                    displayName="Promo Image"
                    fieldId={props.promoImage.image.field}
                    constantValueEnabled={props.promoImage.image.constantValueEnabled}
                  >
                    <div
                      className={`luxury-seasonal-promo__image-frame${
                        promoImageHasAspectRatio
                          ? " luxury-seasonal-promo__image-frame--has-ratio"
                          : ""
                      }`}
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: promoImageHasAspectRatio
                          ? props.promoImage.aspectRatio
                          : undefined,
                        borderRadius:
                          props.promoImage.styles?.borderRadius === "default"
                            ? undefined
                            : props.promoImage.styles?.borderRadius,
                        overflow:
                          props.promoImage.imageConstrain === "filled" ||
                          Boolean(
                            props.promoImage.styles?.borderRadius &&
                              props.promoImage.styles.borderRadius !== "default",
                          ) ||
                          promoImageHasAspectRatio
                            ? "hidden"
                            : undefined,
                      }}
                    >
                      <Image
                        image={image}
                        style={{
                          display: "block",
                          width: "100%",
                          height: promoImageHasAspectRatio ? "100%" : "auto",
                          objectFit:
                            props.promoImage.imageConstrain === "filled"
                              ? "cover"
                              : "contain",
                          objectPosition: "center",
                        }}
                      />
                    </div>
                  </EntityField>
                </div>
              </div>
            ) : null}
          </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailSeasonalPromoSection: YextComponentConfig<
  LuxuryRetailSeasonalPromoSectionProps
> = {
  label: "Seasonal Promo Section",
  fields: LuxuryRetailSeasonalPromoSectionFields,
  defaultProps: {
    heading: {
      text: {
        field: "",
        constantValue: {
          defaultValue: "Shop our Seasonal Collection",
        },
        constantValueEnabled: true,
      },
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      fontColor: {
        selectedColor: "palette-primary",
        contrastingColor: "palette-primary-contrast",
      },
    },
    body: {
      text: {
        field: "",
        constantValue: {
          defaultValue: getDefaultRTF(
            "Explore our latest arrivals featuring sustainable fabrics, modern silhouettes, and timeless essentials.",
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
    cta: {
      data: {
        actionType: "link",
        cta: {
          field: "",
          constantValue: {
            label: {
              defaultValue: "Show now",
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
      eventName: "cta",
    },
    promoImage: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      aspectRatio: 0,
      imageConstrain: "filled",
      styles: {
        borderRadius: "default",
      },
    },
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
      visibleOnLivePage: true,
    },
  },
  render: (props) => <LuxuryRetailSeasonalPromoSectionComponent {...props} />,
};

export const config: SectionConfig = {
  id: "LuxuryRetailSeasonalPromoSection",
  displayName: "Seasonal Promo Section",
  description: "Seasonal Promo Section",
  pageSetTypes: ["ENTITY"],
};
