import "../shared/typography.css";
import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  pt,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultRTF,
  Image,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
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
import {
  getReadableTextColor as resolveReadableTextColor,
  getReadableThemeColor as resolveReadableThemeColor,
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

type LuxuryRetailCommunitySectionProps = {
  heading: StyledTextProps;
  body: StyledRtfProps & { styles?: StyledTextValue };
  cta: ComprehensiveCTAValue;
  image: SectionImageProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const LuxuryRetailCommunitySectionFields: YextFields<LuxuryRetailCommunitySectionProps> =
  {
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
    cta: {
      label: msg("fields.cta", "CTA"),
      type: "comprehensiveCTA",
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

const communityCss = `
  .luxury-community {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    width: 100%;
    margin: 0;
  }

  .luxury-community__inner {
    width: 100%;
    max-width: var(--maxWidth-pageSection-contentWidth);
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
    width: 100%;
  }

  .luxury-community__heading {
    margin: 0 0 16px;
  }

  .luxury-community__body p {
    margin: 0;
  }

  .luxury-community__cta {
    display: inline-flex;
    align-items: center;
    margin-top: 24px;
    position: relative;

    transition: transform 0.18s ease;
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
    padding: 0 56px;
  }

  .luxury-community__content--text-only .luxury-community__copy-inner {
    width: 100%;
    margin: 0 auto;
  }

  @media (max-width: 1100px) {
    .luxury-community {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    }

    .luxury-community__inner {
      width: 100%;
      max-width: var(--maxWidth-pageSection-contentWidth);
    }

    .luxury-community__content {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .luxury-community__copy,
    .luxury-community__content--text-only .luxury-community__copy {
      padding: 0;
    }

    .luxury-community__image-frame,
    .luxury-community__image-frame img {
      max-height: 420px;
    }
  }

  @media (max-width: 720px) {
    .luxury-community__image-frame,
    .luxury-community__image-frame img {
      max-height: 320px;
    }
  }
`;

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
  const readableTextColor = resolveReadableTextColor(
    undefined,
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
    color: resolveReadableTextColor(props.body.fontColor, props.section?.backgroundColor, streamDocument),
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
    objectPosition: "center",
  };
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
  const sectionStyle = getSurfaceColorStyle(
    props.section?.backgroundColor,
    streamDocument,
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
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-community"
          style={sectionStyle}
        >
          <div className="luxury-community__inner">
          <div
            className={`luxury-community__content${hasImage ? "" : " luxury-community__content--text-only"}`}
          >
            <div className="luxury-community__copy">
              <div className="luxury-community__copy-inner">
                <EntityField
                  displayName={pt("heading", "Heading")}
                  fieldId={props.heading.text.field}
                  constantValueEnabled={props.heading.text.constantValueEnabled}
                >
                  <h2 className="luxury-community__heading" style={headingStyle}>
                    {heading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName={pt("fields.body", "Body")}
                  fieldId={props.body.text.field}
                  constantValueEnabled={props.body.text.constantValueEnabled}
                >
                  <div
                    className="luxury-community__body"
                  >
                    {bodyContent}
                  </div>
                </EntityField>
                <EntityField
                  displayName={pt("callToAction", "Call to Action")}
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
                style={sectionStyle}
              >
                <EntityField
                  displayName={pt("fields.image", "Image")}
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
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailCommunitySection: YextComponentConfig<LuxuryRetailCommunitySectionProps> =
  {
    label: msg("components.communitySection", "Community Section"),
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
        fontColor: undefined,
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
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
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
            borderRadius: "default",
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
