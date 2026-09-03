import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  Image,
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

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  fontColor?: ThemeColor;
};

type SectionImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type LuxuryRetailCommunitySectionProps = {
  heading: StyledTextProps;
  body: StyledRtfProps;
  cta: ComprehensiveCTAValue;
  image: SectionImageProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

type VisualEditorImageValue = NonNullable<React.ComponentProps<typeof Image>["image"]>;

const LuxuryRetailCommunitySectionFields: YextFields<LuxuryRetailCommunitySectionProps> =
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
    image: {
      label: "Image",
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

  switch (color.selectedColor) {
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
      return color.selectedColor;
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

const communityCss = `
  .luxury-community :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-community :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-community :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-community :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-community :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-community :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-community :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-community :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-community :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-community {
    width: 100%;
    margin: 0;
    padding-top: 48px;
  }

  .luxury-community__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
  }

  .luxury-community__content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .luxury-community__copy {
    display: flex;
    align-items: center;
    padding-right: 56px;
  }

  .luxury-community__copy-inner {
    max-width: 560px;
  }

  .luxury-community__heading {
    margin: 0 0 16px;
    font-family: var(--fontFamily-h2-fontFamily, Georgia, serif);
    font-size: clamp(36px, 3vw, 58px);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.01em;
  }

  .luxury-community__body {
    font-size: 15px;
    line-height: 1.6;
  }

  .luxury-community__body p {
    margin: 0;
  }

  .luxury-community__cta {
    display: inline-flex;
    align-items: center;
    position: relative;
    text-decoration: none;
    transition: transform 0.18s ease;
  }

  .luxury-community__cta--button {
    justify-content: center;
    min-height: 48px;
    margin-top: 24px;
    padding: 0 24px;
  }

  .luxury-community__cta--underlined {
    gap: 8px;
    margin-top: 24px;
    padding: 8px 12px 8px 0;
  }

  .luxury-community__cta--underlined::after {
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

  .luxury-community__cta--underlined:hover,
  .luxury-community__cta--underlined:focus-visible {
    transform: translateX(4px);
  }

  .luxury-community__cta--underlined:hover::after,
  .luxury-community__cta--underlined:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  .luxury-community__image-shell {
    align-self: start;
    overflow: hidden;
  }

  .luxury-community__image-frame > *,
  .luxury-community__image-frame [data-entity-field],
  .luxury-community__image-frame div,
  .luxury-community__image-frame picture,
  .luxury-community__image-frame img {
    display: block;
    width: 100%;
    overflow: hidden;
    border-radius: inherit;
  }

  .luxury-community__image-frame--has-ratio > *,
  .luxury-community__image-frame--has-ratio [data-entity-field],
  .luxury-community__image-frame--has-ratio div,
  .luxury-community__image-frame--has-ratio picture,
  .luxury-community__image-frame--has-ratio img {
    height: 100%;
  }

  .luxury-community__content--text-only {
    grid-template-columns: 1fr;
  }

  .luxury-community__content--text-only .luxury-community__copy {
    padding: 48px 56px;
  }

  .luxury-community__content--text-only .luxury-community__copy-inner {
    max-width: 760px;
    margin: 0 auto;
  }

  @media (max-width: 1100px) {
    .luxury-community {
      padding-top: 32px;
    }

    .luxury-community__inner {
      width: calc(100vw - 40px);
    }

    .luxury-community__content {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .luxury-community__copy {
      padding-right: 0;
    }

    .luxury-community__image-shell {
      max-height: 420px;
    }
  }

  @media (max-width: 720px) {
    .luxury-community__image-shell {
      max-height: 320px;
    }
  }
`;

function isResolvedImage(
  image: unknown,
): image is VisualEditorImageValue {
  return (
    typeof image === "object" &&
    image !== null &&
    ("url" in image || "image" in image)
  );
}

function hasImageSource(image: unknown): image is VisualEditorImageValue {
  if (!isResolvedImage(image)) {
    return false;
  }

  if ("url" in image && typeof image.url === "string" && image.url.trim()) {
    return true;
  }

  return (
    "image" in image &&
    Boolean(image.image) &&
    typeof image.image === "object" &&
    "url" in image.image &&
    typeof image.image.url === "string" &&
    Boolean(image.image.url.trim())
  );
}

const LuxuryRetailCommunitySectionComponent: PuckComponent<
  LuxuryRetailCommunitySectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<Record<string, unknown>>();
  const locale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";
  const heading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const body = resolveComponentData(props.body.text, locale, streamDocument);
  const image = resolveComponentData(props.image.image, locale, streamDocument);
  const hasImage = hasImageSource(image);
  const imageHasAspectRatio = props.image.aspectRatio > 0;
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
  const bodyColor =
    resolveThemeColorCssValue(props.body.fontColor) ?? readableTextColor;
  const bodyStyleOverrides = {
    color: bodyColor,
  };
  const imageWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: imageHasAspectRatio ? props.image.aspectRatio : undefined,
    borderRadius:
      props.image.styles?.borderRadius === "default"
        ? undefined
        : props.image.styles?.borderRadius,
    overflow:
      props.image.imageConstrain === "filled" ||
      Boolean(
        props.image.styles?.borderRadius &&
          props.image.styles.borderRadius !== "default",
      ) ||
      imageHasAspectRatio
        ? "hidden"
        : undefined,
  };
  const imageStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: imageHasAspectRatio ? "100%" : "auto",
    objectFit: props.image.imageConstrain === "filled" ? "cover" : "contain",
    objectPosition: "center",
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
  const ctaClassName = `luxury-community__cta ${
    props.cta.styles.variant === "link"
      ? "luxury-community__cta--underlined"
      : "luxury-community__cta--button"
  }`;
  const ctaColor = resolveReadableThemeColor(
    props.cta.styles.color,
    props.section?.backgroundColor,
    streamDocument,
    props.cta.styles.variant,
  );
  const sectionBackgroundColor = resolveThemeColorCssValue(
    props.section?.backgroundColor,
  );

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailCommunitySection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{communityCss}</style>
        <section
          className="luxury-community"
          style={{
            backgroundColor: sectionBackgroundColor,
          }}
        >
          <div className="luxury-community__inner">
          <div
            className={`luxury-community__content${hasImage ? "" : " luxury-community__content--text-only"}`}
          >
            <div className="luxury-community__copy">
              <div className="luxury-community__copy-inner">
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2 className="luxury-community__heading" style={headingStyle}>
                    {heading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Body"
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div className="luxury-community__body" style={{ color: bodyColor }}>
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
                className="luxury-community__image-shell"
                style={{
                  backgroundColor: sectionBackgroundColor,
                }}
              >
                <EntityField
                  displayName="Image"
                  fieldId={props.image.image.field}
                  constantValueEnabled={props.image.image.constantValueEnabled}
                >
                  <div
                    className={`luxury-community__image-frame${
                      imageHasAspectRatio ? " luxury-community__image-frame--has-ratio" : ""
                    }`}
                    style={imageWrapperStyle}
                  >
                    <Image
                      image={image}
                      style={imageStyle}
                    />
                  </div>
                </EntityField>
              </div>
            ) : null}
          </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailCommunitySection: YextComponentConfig<LuxuryRetailCommunitySectionProps> =
  {
    label: "Community Section",
    fields: LuxuryRetailCommunitySectionFields,
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Community & Events",
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
              'Northline Apparel - Lincoln Park hosts monthly "Style & Sip" events and seasonal trend previews. Join our local mailing list to receive invitations to private shopping nights and early access to sales.',
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
                defaultValue: "Join Mailing List",
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
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
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
    render: (props) => <LuxuryRetailCommunitySectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailCommunitySection",
  displayName: "Community Section",
  description: "Community Section",
  pageSetTypes: ["ENTITY"],
};
