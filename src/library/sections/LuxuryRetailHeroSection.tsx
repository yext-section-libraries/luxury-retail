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
  getAggregateRating,
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
import { AnalyticsScopeProvider, HoursStatus, type HoursType } from "@yext/pages-components";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  getReadableTextColor as resolveReadableTextColor,
  getReadableThemeColor as resolveReadableThemeColor,
  getTextStyles as resolveTextStyles,
  hasImageSource,
  resolveBorderRadius,
  renderResolvedRichText,
  type StyledRtfProps,
  type StyledTextProps,
  getSurfaceColorStyle,
} from "../shared/sectionHelpers";
import { createHoursStatusTemplate } from "../shared/components/contentBlocks/createHoursStatusTemplate";

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
  body: StyledRtfProps & { styles?: StyledTextValue };
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

const LuxuryRetailHeroSectionFields: YextFields<LuxuryRetailHeroSectionProps> = {
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
  hours: {
    type: "entityField",
    label: msg("fields.hours", "Hours"),
    filter: {
      types: ["type.hours"],
    },
    disableConstantValueToggle: true,
  },
  hoursStyles: {
    label: msg("fields.hoursStyles", "Hours Styles"),
    type: "object",
    objectFields: {
      showCurrentStatus: {
        label: msg("fields.showCurrentStatus", "Show Current Status"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      timeFormat: {
        label: msg("fields.timeFormat", "Time Format"),
        type: "select",
        options: [
          { label: msg("fields.options.hour12Label", "12 Hour"), value: "12h" },
          { label: msg("fields.options.hour24Label", "24 Hour"), value: "24h" },
        ],
      },
      dayOfWeekFormat: {
        label: msg("fields.dayOfWeekFormat", "Day of Week Format"),
        type: "select",
        options: [
          { label: msg("fields.options.short", "Short"), value: "short" },
          { label: msg("fields.options.long", "Long"), value: "long" },
        ],
      },
      showDayNames: {
        label: msg("fields.showDayNames", "Show Day Names"),
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
        filter: {
          types: ["type.string"],
        },
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
  subheading: {
    label: msg("fields.subheading", "Subheading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: {
          types: ["type.string"],
        },
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
        filter: {
          types: ["type.rich_text_v2"],
        },
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
  heroImage: {
    label: msg("fields.heroImage", "Hero Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: {
          types: ["type.image"],
        },
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
  primaryCta: {
    label: msg("fields.primaryCTA", "Primary CTA"),
    type: "comprehensiveCTA",
  },
  secondaryCta: {
    label: msg("fields.secondaryCTA", "Secondary CTA"),
    type: "comprehensiveCTA",
  },
  ratingSummary: {
    label: msg("fields.ratingSummary", "Rating Summary"),
    type: "object",
    objectFields: {
      visible: {
        label: msg("fields.visible", "Visible"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
};

const heroCss = `
  .luxury-hero {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    width: 100%;
  }

  .luxury-hero__inner {
    width: 100%;
    max-width: var(--maxWidth-pageSection-contentWidth);
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
    border-radius: inherit;
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

  .luxury-hero__inner--text-only .luxury-hero__content {
    width: 100%;
  }

  .luxury-hero__panel {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 48px;
  }

  .luxury-hero__content {
    width: 100%;
    text-align: center;
  }

  .luxury-hero__status {
    margin: 0 0 16px;
  }

  .luxury-hero__heading {
    margin: 0;
  }

  .luxury-hero__subheading {
    margin: 0 0 24px;
  }

  .luxury-hero__rating {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 24px;
  }

  .luxury-hero__rating--after-heading {
    margin-top: 24px;
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

    transition: transform 0.18s ease;
  }

  .luxury-hero__status .HoursStatus {
    min-height: 0;
  }

  @media (max-width: 1100px) {
    .luxury-hero__inner {
      width: 100%;
      max-width: var(--maxWidth-pageSection-contentWidth);
      grid-template-columns: 1fr;
      row-gap: 32px;
    }

    .luxury-hero__image-shell {
      min-height: 280px;
      max-height: 360px;
    }

    .luxury-hero__panel {
      padding: 0 28px;
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

  }
`;

const LuxuryRetailHeroSectionComponent: PuckComponent<
  LuxuryRetailHeroSectionProps
> = ({ id, puck, ...props }) => {
  const { t, i18n } = useTranslation();
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
    resolveBorderRadius(props.heroImage.styles.borderRadius);
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
  const resolvedBodyContent = renderResolvedRichText(resolvedBody, {
    ...props.body.styles,
    color: resolveReadableTextColor(props.body.fontColor, props.section?.backgroundColor, liveStreamDocument),
  });
  const { averageRating, reviewCount } = getAggregateRating(liveStreamDocument);
  const headingColor = resolveReadableTextColor(
    props.heading.fontColor,
    props.section?.backgroundColor,
    liveStreamDocument,
  );
  const statusColor = resolveReadableTextColor(
    undefined,
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
  const sectionStyle = getSurfaceColorStyle(
    props.section?.backgroundColor,
    liveStreamDocument,
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
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-hero"
          style={sectionStyle}
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
                backgroundColor: sectionStyle?.backgroundColor,
                borderRadius: heroImageBorderRadius,
              }}
            >
              <EntityField
                displayName={pt("fields.heroImage", "Hero Image")}
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
                style={{ color: statusColor }}
              >
                <EntityField
                  displayName={pt("hours", "Hours")}
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
                      statusTemplate={createHoursStatusTemplate({
                        t,
                        locale,
                        showCurrentStatus: props.hoursStyles.showCurrentStatus,
                        showDayNames: props.hoursStyles.showDayNames,
                        boldCurrentStatus: false,
                      })}
                      dayOptions={{
                        weekday: props.hoursStyles.dayOfWeekFormat,
                      }}
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
                displayName={pt("heading", "Heading")}
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
                  displayName={pt("fields.subheading", "Subheading")}
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
                  aria-label={t("storeDetails", "Store details")}
                  style={{ color: statusColor }}
                >
                  <FaStar aria-hidden="true" />
                  {t(
                    "starsFromCustomerReviews",
                    "{{averageRating}} stars from {{reviewCount}} customer reviews",
                    {
                      averageRating: averageRating.toFixed(1),
                      reviewCount,
                    },
                  )}
                </p>
              ) : null}

              <EntityField
                displayName={pt("fields.body", "Body")}
                fieldId={props.body.text.field}
                constantValueEnabled={props.body.text.constantValueEnabled}
              >
                <div
                  className="luxury-hero__body"
                >
                  {resolvedBodyContent}
                </div>
              </EntityField>

              <div className="luxury-hero__ctas">
                <EntityField
                  displayName={pt("fields.primaryCallToAction", "Primary Call to Action")}
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
                  displayName={pt("fields.secondaryCallToAction", "Secondary Call to Action")}
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
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailHeroSection: YextComponentConfig<LuxuryRetailHeroSectionProps> =
  {
    label: msg("components.heroSection", "Hero Section"),
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
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
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
            borderRadius: "default",
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
            borderRadius: "default",
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
