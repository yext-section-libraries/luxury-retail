import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  getAnalyticsScopeHash,
  isDarkColor,
  resolveComponentData,
  useDocument,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  getAggregateRating,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type LuxuryRetailReviewsSectionProps = {
  title: StyledTextProps;
  reviewColor?: ThemeColor;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const LuxuryRetailReviewsSectionFields: YextFields<LuxuryRetailReviewsSectionProps> =
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
    reviewColor: {
      label: "Review Color",
      type: "basicSelector",
      options: "SITE_COLOR",
    },
  };

const reviewsCss = `
  .luxury-reviews :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-reviews :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-reviews :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-reviews :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-reviews :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-reviews :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-reviews :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-reviews :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-reviews :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-reviews {
    width: 100%;
    margin: 0;
    padding: 96px 0 48px;
  }

  .luxury-reviews__inner {
    width: min(1120px, calc(100vw - 64px));
    margin: 0 auto;
  }

  .luxury-reviews__title {
    margin: 0 0 16px;
    font-family: var(--fontFamily-h3-fontFamily, Georgia, serif);
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;
  }

  .luxury-reviews__summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin: 0 0 48px;
    font-size: 15px;
    line-height: 1.2;
  }

  .luxury-reviews__list {
    display: grid;
    gap: 28px;
    max-width: 710px;
    margin: 0 auto;
  }

  .luxury-reviews__card {
    width: 100%;
    margin: 0;
  }

  .luxury-reviews__card-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 18px;
    margin-bottom: 12px;
  }

  .luxury-reviews__name {
    margin: 0;
    font-family: var(--fontFamily-h4-fontFamily, Georgia, serif);
    font-size: clamp(18px, 1.5vw, 22px);
    font-weight: 400;
    line-height: 1.35;
  }

  .luxury-reviews__rating {
    display: inline-flex;
    align-items: baseline;
    gap: 14px;
    margin: 0;
    font-size: 15px;
    line-height: 1.2;
  }

  .luxury-reviews__copy {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
  }

  @media (max-width: 720px) {
    .luxury-reviews {
      padding: 64px 0 32px;
    }

    .luxury-reviews__inner {
      width: calc(100vw - 40px);
    }

    .luxury-reviews__summary {
      flex-wrap: wrap;
      gap: 10px;
      font-size: 18px;
    }
  }
`;

function getThemeColorCssValue(color?: ThemeColor | string): string | undefined {
  const selectedColor = typeof color === "string" ? color : color?.selectedColor;
  if (!selectedColor || selectedColor === "default") {
    return undefined;
  }

  switch (selectedColor) {
    case "white":
      return "#FFFFFF";
    case "black":
      return "#000000";
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
    default:
      return selectedColor;
  }
}

function getReadableTextColor(
  fontColor: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
): string {
  return (
    getThemeColorCssValue(fontColor) ??
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
}

type Review = {
  authorName?: string;
  rating?: number;
  content?: string;
  reviewDate?: string;
  comments?: { content?: string }[];
};

type ReviewStreamDocument = {
  locale?: string;
  ref_reviewsAgg?: {
    publisher?: string;
    topReviews?: Review[];
  }[];
};

const LuxuryRetailReviewsSectionComponent: PuckComponent<
  LuxuryRetailReviewsSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<ReviewStreamDocument & Record<string, unknown>>();
  const locale = streamDocument.locale ?? "en";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const title = resolveComponentData(props.title.text, locale, streamDocument) || "";
  const readableTextColor = getReadableTextColor(
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
    color: getThemeColorCssValue(props.title.fontColor) ?? readableTextColor,
  };
  const sectionStyle: React.CSSProperties = {
    backgroundColor: getThemeColorCssValue(props.section?.backgroundColor),
    color: readableTextColor,
  };
  const reviewColor = getThemeColorCssValue(props.reviewColor) ?? readableTextColor;

  if (!reviews.length && !props.puck.isEditing) {
    return <></>;
  }

  if (!reviews.length) {
    return (
      <AnalyticsScopeProvider
        name={`LuxuryRetailReviewsSection${getAnalyticsScopeHash(id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.section.visibleOnLivePage}
          isEditing={props.puck.isEditing}
        >
          <style>{reviewsCss}</style>
          <section className="luxury-reviews" style={sectionStyle}>
            <div className="luxury-reviews__inner">
              <EntityField
                displayName="Title"
                fieldId={props.title.text.field}
                constantValueEnabled={props.title.text.constantValueEnabled}
              >
                <h2 className="luxury-reviews__title" style={titleStyle}>
                  {title}
                </h2>
              </EntityField>
              {!reviews.length && props.puck.isEditing ? (
                <p>No first-party reviews</p>
              ) : null}
            </div>
          </section>
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  }

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailReviewsSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{reviewsCss}</style>
        <section className="luxury-reviews" style={sectionStyle}>
          <div className="luxury-reviews__inner">
            <EntityField
              displayName="Title"
              fieldId={props.title.text.field}
              constantValueEnabled={props.title.text.constantValueEnabled}
            >
              <h2 className="luxury-reviews__title" style={titleStyle}>
                {title}
              </h2>
            </EntityField>
            <p
              className="luxury-reviews__summary"
              aria-label="Customer rating summary"
              style={{ color: reviewColor }}
            >
              <span>{averageRating.toFixed(1)}</span>
              <span aria-hidden="true">★★★★★</span>
              <span>|</span>
              <span>{`${reviewCount} Reviews`}</span>
            </p>
            <div className="luxury-reviews__list">
              {reviews.slice(0, 3).map((review, index) => (
                <article
                  className="luxury-reviews__card"
                  key={`${review.authorName}-${index}`}
                  style={{ color: reviewColor }}
                >
                  <header className="luxury-reviews__card-header">
                    <h3 className="luxury-reviews__name">
                      {review.authorName || "Reviewer"}
                    </h3>
                    <p
                      className="luxury-reviews__rating"
                      style={{ color: reviewColor }}
                    >
                      <span aria-hidden="true">
                        {"★".repeat(Math.round(review.rating ?? 5))}
                      </span>
                      <span>{`${review.rating ?? 5}/5 stars`}</span>
                    </p>
                  </header>
                  <p
                    className="luxury-reviews__copy"
                    style={{ color: reviewColor }}
                  >
                    {review.content}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailReviewsSection: YextComponentConfig<LuxuryRetailReviewsSectionProps> =
  {
    label: "Reviews Section",
    fields: LuxuryRetailReviewsSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "What Customers Are Saying",
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
      reviewColor: {
        selectedColor: "palette-quaternary",
        contrastingColor: "palette-quaternary-contrast",
      },
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        visibleOnLivePage: true,
      },
    },
    render: (props) => <LuxuryRetailReviewsSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailReviewsSection",
  displayName: "Reviews Section",
  description: "Reviews Section",
  pageSetTypes: ["ENTITY"],
};
