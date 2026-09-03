import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  createItemSource,
  EntityField,
  MaybeRTF,
  getDefaultRTF,
  getAnalyticsScopeHash,
  isDarkColor,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type StyledTextValue,
  type ComprehensiveCTAValue,
  type EnhancedTranslatableCTA,
  type ThemeColor,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  Image,
  toPuckFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useTranslation } from "react-i18next";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type SharedCardTextStyles = Omit<StyledTextProps, "text">;

type SharedCardImageStyles = {
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type ExperienceCardFields = {
  eyebrow: YextEntityField<TranslatableString>;
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: YextEntityField<EnhancedTranslatableCTA>;
  image: YextEntityField<TranslatableAssetImage>;
};

const createExperienceCard = (
  eyebrow: string,
  title: string,
  description: string,
  ctaLabel: string,
  imageUrl: string,
): ExperienceCardFields => ({
  eyebrow: {
    field: "",
    constantValue: { defaultValue: eyebrow },
    constantValueEnabled: true,
  },
  title: {
    field: "",
    constantValue: { defaultValue: title },
    constantValueEnabled: true,
  },
  description: {
    field: "",
    constantValue: {
      defaultValue: getDefaultRTF(description),
      hasLocalizedValue: "true",
    },
    constantValueEnabled: true,
  },
  cta: {
    field: "",
    constantValue: {
      label: { defaultValue: ctaLabel },
      link: { defaultValue: "#" },
      linkType: "URL",
      ctaType: "textAndLink",
      openInNewTab: false,
    },
    constantValueEnabled: true,
  },
  image: {
    field: "",
    constantValue: { url: imageUrl, width: 1267, height: 1900 },
    constantValueEnabled: true,
  },
});

const experienceCardsSource = createItemSource<ExperienceCardFields>({
  label: "Cards",
  mappingFields: {
    eyebrow: {
      type: "entityField",
      label: "Eyebrow",
      filter: { types: ["type.string"] },
    },
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    cta: {
      type: "entityField",
      label: "Call to Action",
      filter: { types: ["type.cta"] },
    },
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
  },
  defaultValues: [
    createExperienceCard(
      "In-Store Service",
      "Personal Styling",
      "Work one-on-one with a style expert to refresh your wardrobe or find the perfect outfit for a special event.",
      "Book a Free Session",
      "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
    ),
    createExperienceCard(
      "Denim Edit",
      "Premium Denim Lab",
      "Find your perfect fit with our specialized denim consultants and on-site tailoring for hem adjustments.",
      "Browse Denim Collection",
      "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
    ),
    createExperienceCard(
      "Same-Day Convenience",
      "Buy Online, Pick Up In-Store",
      'Skip the shipping and get your items today. Simply select "Lincoln Park" at checkout.',
      "Start Shopping",
      "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
    ),
    createExperienceCard(
      "Perfect Fit",
      "Alterations & Tailoring",
      "Ensure every piece fits perfectly. Our on-site tailor provides professional adjustments for Northline Apparel garments.",
      "View Tailoring Menu",
      "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
    ),
  ],
});

type LuxuryRetailShoppingExperiencesSectionProps = {
  title: StyledTextProps;
  cards: {
    data: typeof experienceCardsSource.value;
    styles: {
      eyebrow: SharedCardTextStyles;
      title: SharedCardTextStyles;
      description: SharedCardTextStyles;
      cta: ComprehensiveCTAValue["styles"];
      image: SharedCardImageStyles;
    };
  };
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

type VisualEditorImageValue = NonNullable<
  React.ComponentProps<typeof Image>["image"]
>;

const LuxuryRetailShoppingExperiencesSectionFields: YextFields<LuxuryRetailShoppingExperiencesSectionProps> =
  {
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
    title: {
      label: "Title",
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
    cards: {
      label: "Cards",
      type: "object",
      objectFields: {
        data: experienceCardsSource.field,
        styles: {
          label: "Styles",
          type: "object",
          objectFields: {
            eyebrow: {
              label: "Eyebrow",
              type: "object",
              objectFields: {
                styles: { label: "Text Styles", type: "styledText" },
                fontColor: {
                  label: "Font Color",
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
              },
            },
            title: {
              label: "Title",
              type: "object",
              objectFields: {
                styles: { label: "Text Styles", type: "styledText" },
                fontColor: {
                  label: "Font Color",
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
              },
            },
            description: {
              label: "Description",
              type: "object",
              objectFields: {
                styles: { label: "Text Styles", type: "styledText" },
                fontColor: {
                  label: "Font Color",
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
              },
            },
            cta: {
              label: "Call to Action",
              type: "object",
              objectFields: {
                variant: {
                  label: "Variant",
                  type: "select",
                  options: [
                    { label: "Link", value: "link" },
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                  ],
                },
                color: {
                  label: "Color",
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
                link: { label: "Link Styles", type: "styledLink" },
              },
            },
            image: {
              label: "Image",
              type: "object",
              objectFields: {
                aspectRatio: { label: "Aspect Ratio", type: "number" },
                imageConstrain: {
                  label: "Image Constrain",
                  type: "select",
                  options: [
                    { label: "Fixed", value: "fixed" },
                    { label: "Filled", value: "filled" },
                  ],
                },
                styles: { label: "Image Styles", type: "styledImage" },
              },
            },
          },
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

const sectionCss = `
  .luxury-experiences :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-experiences :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-experiences :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-experiences :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-experiences :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-experiences :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-experiences :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-experiences :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-experiences :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-experiences {
    width: 100%;
    margin: 0;
    padding: 48px 0;
  }

  .luxury-experiences__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
  }

  .luxury-experiences__content {
    display: grid;
    gap: 40px;
  }

  .luxury-experiences__title {
    margin: 0;
    font-family: var(--fontFamily-h3-fontFamily, Georgia, serif);
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;
  }

  .luxury-experiences__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 30px;
  }

  .luxury-experiences__card {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .luxury-experiences__eyebrow {
    margin: 0 0 6px;
    color: var(--colors-palette-tertiary);
    font-family: var(--fontFamily-h4-fontFamily, Georgia, serif);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .luxury-experiences__card-title {
    margin: 0 0 12px;
    color: var(--colors-palette-primary);
    font-family: var(--fontFamily-h4-fontFamily, Georgia, serif);
    font-size: clamp(18px, 1.5vw, 22px);
    font-weight: 400;
    line-height: 1.35;
  }

  .luxury-experiences__image-shell {
    overflow: hidden;
  }

  .luxury-experiences__image-shell [data-entity-field],
  .luxury-experiences__image-shell div,
  .luxury-experiences__image-shell picture,
  .luxury-experiences__image-shell img {
    display: block;
    width: 100%;
    overflow: hidden;
    border-radius: inherit;
  }

  .luxury-experiences__image-shell--has-ratio > *,
  .luxury-experiences__image-shell--has-ratio [data-entity-field],
  .luxury-experiences__image-shell--has-ratio div,
  .luxury-experiences__image-shell--has-ratio picture,
  .luxury-experiences__image-shell--has-ratio img {
    height: 100%;
  }

  .luxury-experiences__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 16px;
    padding-top: 16px;
    color: var(--colors-palette-tertiary);
    font-size: 15px;
    line-height: 1.6;
  }

  .luxury-experiences__body--no-image {
    padding-top: 0;
  }

  .luxury-experiences__body p {
    margin: 0;
  }

  .luxury-experiences__link {
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    position: relative;
    text-decoration: none;
    transition: transform 0.18s ease;
  }

  .luxury-experiences__link--underlined {
    padding: 8px 12px 8px 0;
  }

  .luxury-experiences__link--underlined::after {
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

  .luxury-experiences__link--underlined:hover,
  .luxury-experiences__link--underlined:focus-visible {
    transform: translateX(4px);
  }

  .luxury-experiences__link--underlined:hover::after,
  .luxury-experiences__link--underlined:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  @media (max-width: 1100px) {
    .luxury-experiences {
      padding: 32px 0;
    }

    .luxury-experiences__inner {
      width: calc(100vw - 40px);
    }
  }

  @media (max-width: 1020px) {
    .luxury-experiences__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      row-gap: 48px;
    }
  }

  @media (max-width: 720px) {
    .luxury-experiences__grid {
      grid-template-columns: 1fr;
      row-gap: 32px;
    }

    .luxury-experiences__body {
      padding-top: 14px;
    }
  }
`;

const LuxuryRetailShoppingExperiencesSectionComponent: PuckComponent<
  LuxuryRetailShoppingExperiencesSectionProps
> = ({ id, ...props }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument<Record<string, unknown>>();
  const title =
    resolveComponentData(props.title.text, locale, streamDocument) || "";
  const resolvedCards = experienceCardsSource.resolveItems(
    props.cards.data,
    streamDocument,
  );
  const readableTextColor = resolveReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const titleStyle: React.CSSProperties = {
    fontFamily:
      props.title.styles.fontFamily === "default"
        ? undefined
        : props.title.styles.fontFamily,
    fontSize:
      props.title.styles.fontSize === "default"
        ? undefined
        : props.title.styles.fontSize,
    fontWeight:
      props.title.styles.fontWeight === "default"
        ? undefined
        : props.title.styles.fontWeight,
    fontStyle:
      props.title.styles.fontStyle === "default"
        ? undefined
        : props.title.styles.fontStyle,
    textTransform:
      props.title.styles.textTransform === "default"
        ? undefined
        : props.title.styles.textTransform,
    color:
      resolveThemeColorCssValue(props.title.fontColor) ?? readableTextColor,
  };

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailShoppingExperiencesSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{sectionCss}</style>
        <section
          className="luxury-experiences"
          style={{
            backgroundColor: resolveThemeColorCssValue(
              props.section?.backgroundColor,
            ),
          }}
        >
          <div className="luxury-experiences__inner">
            <div className="luxury-experiences__content">
              <EntityField
                displayName="Title"
                fieldId={props.title.text.field}
                constantValueEnabled={props.title.text.constantValueEnabled}
              >
                <h2 className="luxury-experiences__title" style={titleStyle}>
                  {title}
                </h2>
              </EntityField>

              <EntityField
                displayName="Cards"
                fieldId={props.cards.data.field}
                constantValueEnabled={props.cards.data.constantValueEnabled}
              >
                <div className="luxury-experiences__grid">
                  {resolvedCards.map((card, index) => {
                    const image = card.image;
                    const hasCardImage = hasImageSource(image);
                    const eyebrow = card.eyebrow
                      ? resolveComponentData(
                          card.eyebrow,
                          locale,
                          streamDocument,
                        ) || ""
                      : "";
                    const cardTitle = card.title
                      ? resolveComponentData(
                          card.title,
                          locale,
                          streamDocument,
                        ) || ""
                      : "";
                    const descriptionStyleOverrides = {
                      ...props.cards.styles.description.styles,
                      color:
                        resolveThemeColorCssValue(
                          props.cards.styles.description.fontColor,
                        ) ?? readableTextColor,
                    };
                    const description = card.description
                      ? resolveComponentData(
                          card.description,
                          locale,
                          streamDocument,
                          { richTextStyleOverrides: descriptionStyleOverrides },
                        )
                      : undefined;
                    const eyebrowStyle: React.CSSProperties = {
                      fontFamily:
                        props.cards.styles.eyebrow.styles.fontFamily ===
                        "default"
                          ? undefined
                          : props.cards.styles.eyebrow.styles.fontFamily,
                      fontSize:
                        props.cards.styles.eyebrow.styles.fontSize === "default"
                          ? undefined
                          : props.cards.styles.eyebrow.styles.fontSize,
                      fontWeight:
                        props.cards.styles.eyebrow.styles.fontWeight ===
                        "default"
                          ? undefined
                          : props.cards.styles.eyebrow.styles.fontWeight,
                      fontStyle:
                        props.cards.styles.eyebrow.styles.fontStyle ===
                        "default"
                          ? undefined
                          : props.cards.styles.eyebrow.styles.fontStyle,
                      textTransform:
                        props.cards.styles.eyebrow.styles.textTransform ===
                        "default"
                          ? undefined
                          : props.cards.styles.eyebrow.styles.textTransform,
                      color:
                        resolveThemeColorCssValue(
                          props.cards.styles.eyebrow.fontColor,
                        ) ?? readableTextColor,
                    };
                    const cardTitleStyle: React.CSSProperties = {
                      fontFamily:
                        props.cards.styles.title.styles.fontFamily === "default"
                          ? undefined
                          : props.cards.styles.title.styles.fontFamily,
                      fontSize:
                        props.cards.styles.title.styles.fontSize === "default"
                          ? undefined
                          : props.cards.styles.title.styles.fontSize,
                      fontWeight:
                        props.cards.styles.title.styles.fontWeight === "default"
                          ? undefined
                          : props.cards.styles.title.styles.fontWeight,
                      fontStyle:
                        props.cards.styles.title.styles.fontStyle === "default"
                          ? undefined
                          : props.cards.styles.title.styles.fontStyle,
                      textTransform:
                        props.cards.styles.title.styles.textTransform ===
                        "default"
                          ? undefined
                          : props.cards.styles.title.styles.textTransform,
                      color:
                        resolveThemeColorCssValue(
                          props.cards.styles.title.fontColor,
                        ) ?? readableTextColor,
                    };
                    const imageBorderRadius =
                      props.cards.styles.image.styles?.borderRadius ===
                      "default"
                        ? undefined
                        : props.cards.styles.image.styles?.borderRadius;
                    const cardImageHasAspectRatio =
                      props.cards.styles.image.aspectRatio > 0;
                    const cardCtaColor = resolveReadableThemeColor(
                      props.cards.styles.cta.color,
                      props.section?.backgroundColor,
                      streamDocument,
                      props.cards.styles.cta.variant,
                    );

                    return (
                      <article
                        className="luxury-experiences__card"
                        key={`${cardTitle}-${index}`}
                      >
                        <p
                          className="luxury-experiences__eyebrow"
                          style={eyebrowStyle}
                        >
                          {eyebrow}
                        </p>
                        <h3
                          className="luxury-experiences__card-title"
                          style={cardTitleStyle}
                        >
                          {cardTitle}
                        </h3>
                        {hasCardImage ? (
                          <div
                            className={`luxury-experiences__image-shell luxury-experiences__image-shell--${props.cards.styles.image.imageConstrain}${
                              cardImageHasAspectRatio
                                ? " luxury-experiences__image-shell--has-ratio"
                                : ""
                            }`}
                            style={{
                              aspectRatio: cardImageHasAspectRatio
                                ? props.cards.styles.image.aspectRatio
                                : undefined,
                              borderRadius: imageBorderRadius,
                              overflow:
                                props.cards.styles.image.imageConstrain ===
                                  "filled" ||
                                Boolean(imageBorderRadius) ||
                                cardImageHasAspectRatio
                                  ? "hidden"
                                  : undefined,
                            }}
                          >
                            <Image
                              image={image}
                              className="luxury-experiences__image"
                              style={{
                                borderRadius: imageBorderRadius,
                                display: "block",
                                width: "100%",
                                height: cardImageHasAspectRatio
                                  ? "100%"
                                  : "auto",
                                objectFit:
                                  props.cards.styles.image.imageConstrain ===
                                  "filled"
                                    ? "cover"
                                    : "contain",
                                objectPosition: "center",
                              }}
                            />
                          </div>
                        ) : null}
                        <div
                          className={`luxury-experiences__body${hasCardImage ? "" : " luxury-experiences__body--no-image"}`}
                          style={{ color: descriptionStyleOverrides.color }}
                        >
                          {React.isValidElement(description) ? (
                            description
                          ) : (
                            <MaybeRTF
                              data={
                                description as
                                  | string
                                  | {
                                      html?: string;
                                      json?: string;
                                    }
                                  | undefined
                              }
                              richTextStyleOverrides={descriptionStyleOverrides}
                            />
                          )}
                          {card.cta ? (
                            <ComprehensiveCTA
                              value={{
                                data: {
                                  actionType: "link",
                                  cta: {
                                    field: "",
                                    constantValue: card.cta,
                                    constantValueEnabled: true,
                                    selectedType:
                                      card.cta.ctaType ?? "textAndLink",
                                  },
                                  openInNewTab: card.cta.openInNewTab ?? false,
                                },
                                styles: {
                                  ...props.cards.styles.cta,
                                  color: cardCtaColor,
                                },
                                eventName: `experienceLink${index}`,
                              }}
                              className={`luxury-experiences__link${
                                props.cards.styles.cta.variant === "link"
                                  ? " luxury-experiences__link--underlined"
                                  : ""
                              }`}
                            />
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </EntityField>
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailShoppingExperiencesSection: YextComponentConfig<LuxuryRetailShoppingExperiencesSectionProps> =
  {
    label: "Shopping Experiences Section",
    fields: toPuckFields(LuxuryRetailShoppingExperiencesSectionFields),
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Featured Shopping Experiences",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "uppercase",
        },
        fontColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
      cards: {
        data: experienceCardsSource.defaultValue,
        styles: {
          eyebrow: {
            styles: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "uppercase",
            },
            fontColor: {
              selectedColor: "palette-tertiary",
              contrastingColor: "palette-tertiary-contrast",
            },
          },
          title: {
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
          description: {
            styles: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
            fontColor: {
              selectedColor: "palette-tertiary",
              contrastingColor: "palette-tertiary-contrast",
            },
          },
          cta: {
            variant: "link",
            color: {
              selectedColor: "palette-primary",
              contrastingColor: "palette-primary-contrast",
            },
            link: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "uppercase",
              letterSpacing: "default",
              includeCaret: "default",
            },
          },
          image: {
            aspectRatio: 1,
            imageConstrain: "filled",
            styles: {
              borderRadius: "default",
            },
          },
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
    render: (props) => (
      <LuxuryRetailShoppingExperiencesSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "LuxuryRetailShoppingExperiencesSection",
  displayName: "Shopping Experiences Section",
  description: "Shopping Experiences Section",
  pageSetTypes: ["ENTITY"],
};
