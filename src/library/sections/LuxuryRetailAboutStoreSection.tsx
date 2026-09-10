import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  Background,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  getSurfaceColorStyle,
  Image,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type ThemeColor,
  type TranslatableAssetImage,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import {
  getReadableTextColor,
  getTextStyles,
  getThemeColorCssValue,
  hasImageSource,
  renderResolvedRichText,
  resolveBorderRadius,
  type StyledRtfProps,
  type StyledTextProps,
} from "../shared/sectionHelpers";

type SectionImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type LuxuryRetailAboutStoreSectionProps = {
  heading: StyledTextProps;
  body: StyledRtfProps;
  image: SectionImageProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const LuxuryRetailAboutStoreSectionFields: YextFields<
  LuxuryRetailAboutStoreSectionProps
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

const splitCss = `
  .luxury-about :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-about :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-about :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-about :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-about :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-about :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-about :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-about :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-about :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-about {
    width: 100%;
    margin: 0;
    padding-top: 48px;
  }

  .luxury-about__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
  }

  .luxury-about__content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .luxury-about__copy-shell {
    display: flex;
    align-items: center;
    order: 2;
    padding: 48px 56px;
  }

  .luxury-about__copy {
    max-width: 560px;
  }

  .luxury-about__heading {
    margin: 0 0 16px;
    font-family: var(--fontFamily-h2-fontFamily, Georgia, serif);
    font-size: clamp(36px, 3vw, 58px);
    font-weight: 400;
    line-height: 0.98;
    letter-spacing: -0.01em;
  }

  .luxury-about__body {
    font-size: 15px;
    line-height: 1.6;
  }

  .luxury-about__image-shell {
    order: 1;
    align-self: start;
    overflow: hidden;
  }

  .luxury-about__image-surface {
    padding: 24px;
  }

  .luxury-about__image-frame > *,
  .luxury-about__image-frame [data-entity-field],
  .luxury-about__image-frame div,
  .luxury-about__image-frame picture,
  .luxury-about__image-frame img {
    display: block;
    width: 100%;
    overflow: hidden;
    border-radius: inherit;
  }

  .luxury-about__image-frame--has-ratio > *,
  .luxury-about__image-frame--has-ratio [data-entity-field],
  .luxury-about__image-frame--has-ratio div,
  .luxury-about__image-frame--has-ratio picture,
  .luxury-about__image-frame--has-ratio img {
    height: 100%;
  }

  .luxury-about__content--text-only {
    grid-template-columns: 1fr;
  }

  .luxury-about__content--text-only .luxury-about__copy-shell {
    order: initial;
    padding: 56px;
  }

  .luxury-about__content--text-only .luxury-about__copy {
    max-width: 760px;
    margin: 0 auto;
  }

  @media (max-width: 1100px) {
    .luxury-about {
      padding-top: 32px;
    }

    .luxury-about__inner {
      width: calc(100vw - 40px);
    }

    .luxury-about__content {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .luxury-about__copy-shell,
    .luxury-about__image-shell {
      order: initial;
    }

    .luxury-about__copy-shell {
      padding: 0;
    }

    .luxury-about__image-shell {
      max-height: 420px;
    }
  }

  @media (max-width: 720px) {
    .luxury-about__image-surface {
      padding: 16px;
    }

    .luxury-about__image-shell {
      max-height: 320px;
    }
  }
`;

const LuxuryRetailAboutStoreSectionComponent: PuckComponent<
  LuxuryRetailAboutStoreSectionProps
> = ({ id, ...props }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument<Record<string, unknown>>();
  const heading = resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const body = resolveComponentData(props.body.text, locale, streamDocument);
  const imageLocale =
    typeof streamDocument.locale === "string" ? streamDocument.locale : "en";
  const image = resolveComponentData(
    props.image.image,
    imageLocale,
    streamDocument,
  );
  const hasImage = hasImageSource(image);
  const imageHasAspectRatio = props.image.aspectRatio > 0;
  const readableTextColor = getReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const sectionStyle = getSurfaceColorStyle(
    props.section?.backgroundColor,
    streamDocument,
  );
  const headingStyle = getTextStyles(
    props.heading.styles,
    props.heading.fontColor,
    readableTextColor,
  );
  const bodyColor = getThemeColorCssValue(props.body.fontColor) ?? readableTextColor;
  const bodyStyleOverrides = {
    color: bodyColor,
  };
  const bodyContent = renderResolvedRichText(body, bodyStyleOverrides);
  const imageWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: imageHasAspectRatio ? props.image.aspectRatio : undefined,
    borderRadius: resolveBorderRadius(props.image.styles?.borderRadius),
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
    objectPosition:
      props.image.imageConstrain === "filled" ? "center 68%" : "center",
  };
  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailAboutStoreSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{splitCss}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-about"
          style={sectionStyle}
        >
          <div className="luxury-about__inner">
          <div
            className={`luxury-about__content${hasImage ? "" : " luxury-about__content--text-only"}`}
          >
            <div className="luxury-about__copy-shell">
              <div className="luxury-about__copy">
                <EntityField
                  displayName="Heading"
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2 className="luxury-about__heading" style={headingStyle}>
                    {heading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Body"
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div className="luxury-about__body" style={{ color: bodyColor }}>
                    {bodyContent}
                  </div>
                </EntityField>
              </div>
            </div>
            {hasImage ? (
              <div
                className="luxury-about__image-shell"
                style={sectionStyle}
              >
                <div className="luxury-about__image-surface">
                  <EntityField
                    displayName="Image"
                    fieldId={props.image.image.field}
                    constantValueEnabled={props.image.image.constantValueEnabled}
                  >
                    <div
                      className={`luxury-about__image-frame${
                        imageHasAspectRatio ? " luxury-about__image-frame--has-ratio" : ""
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
              </div>
            ) : null}
          </div>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailAboutStoreSection: YextComponentConfig<
  LuxuryRetailAboutStoreSectionProps
> = {
  label: "About Store Section",
  fields: LuxuryRetailAboutStoreSectionFields,
  defaultProps: {
    heading: {
      text: {
        field: "",
        constantValue: { defaultValue: "About This Store" },
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
            "Northline Apparel - Lincoln Park is located on 1800 N Halsted St and serves Chicago's diverse neighborhoods. Our flagship offers an elevated shopping experience, combining high-tech convenience with personalized boutique service. The store features modern, spacious fitting rooms with adjustable lighting, a lounge area for companions, and seamless mobile checkout to save you time.",
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
    image: {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
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
  render: (props) => <LuxuryRetailAboutStoreSectionComponent {...props} />,
};

export const config: SectionConfig = {
  id: "LuxuryRetailAboutStoreSection",
  displayName: "About Store Section",
  description: "About Store Section",
  pageSetTypes: ["ENTITY"],
};
