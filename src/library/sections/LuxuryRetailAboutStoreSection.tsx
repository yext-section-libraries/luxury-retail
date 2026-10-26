import "../shared/typography.css";
import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  pt,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  Image,
  resolveComponentData,
  useDocument,
  type StyledImageValue,
  type StyledTextValue,
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
  hasImageSource,
  renderResolvedRichText,
  resolveBorderRadius,
  type StyledRtfProps,
  type StyledTextProps,
  getSurfaceColorStyle,
} from "../shared/sectionHelpers";

type SectionImageProps = {
  image: YextEntityField<TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
  styles: StyledImageValue;
};

type LuxuryRetailAboutStoreSectionProps = {
  heading: StyledTextProps;
  body: StyledRtfProps & { styles?: StyledTextValue };
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
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.string"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  body: {
    label: msg("fields.body", "Body"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.rich_text_v2"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
      },
      fontColor: {
        label: msg("fields.fontColor", "Font Color"),
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  image: {
    label: msg("fields.image", "Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: { types: ["type.image"] },
      },
      aspectRatio: {
        label: msg("fields.aspectRatio", "Aspect Ratio"),
        type: "number",
      },
      imageConstrain: {
        label: msg("fields.imageConstrain", "Image Constrain"),
        type: "select",
        options: [
          { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
          { label: msg("fields.options.filled", "Filled"), value: "filled" },
        ],
      },
      styles: {
        label: msg("fields.imageStyles", "Image Styles"),
        type: "styledImage",
      },
    },
  },
};

const splitCss = `
  .luxury-about {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    width: 100%;
    margin: 0;
  }

  .luxury-about__inner {
    width: 100%;
    max-width: var(--maxWidth-pageSection-contentWidth);
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
    padding: 0 56px;
  }

  .luxury-about__copy {
    width: 100%;
  }

  .luxury-about__heading {
    margin: 0 0 16px;
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
    padding: 0 56px;
  }

  .luxury-about__content--text-only .luxury-about__copy {
    width: 100%;
    margin: 0 auto;
  }

  @media (max-width: 1100px) {
    .luxury-about {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    }

    .luxury-about__inner {
      width: 100%;
      max-width: var(--maxWidth-pageSection-contentWidth);
    }

    .luxury-about__content {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .luxury-about__copy-shell,
    .luxury-about__image-shell {
      order: initial;
    }

    .luxury-about__copy-shell,
    .luxury-about__content--text-only .luxury-about__copy-shell {
      padding: 0;
    }

    .luxury-about__image-frame,
    .luxury-about__image-frame img {
      max-height: 420px;
    }
  }

  @media (max-width: 720px) {
    .luxury-about__image-surface {
      padding: 16px;
    }

    .luxury-about__image-frame,
    .luxury-about__image-frame img {
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
  const bodyContent = renderResolvedRichText(body, {
    ...props.body.styles,
    color: getReadableTextColor(props.body.fontColor, props.section?.backgroundColor, streamDocument),
  });
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
                  displayName={pt("heading", "Heading")}
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2 className="luxury-about__heading" style={headingStyle}>
                    {heading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName={pt("fields.body", "Body")}
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div
                    className="luxury-about__body"
                  >
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
                    displayName={pt("fields.image", "Image")}
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
  label: msg("components.aboutStoreSection", "About Store Section"),
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
      fontColor: undefined,
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
      styles: {
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      },
      fontColor: undefined,
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
