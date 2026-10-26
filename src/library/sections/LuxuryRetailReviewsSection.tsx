import "../shared/typography.css";
import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import {
  msg,
  Background,
  pt,
  EntityField,
  getAnalyticsScopeHash,
  resolveComponentData,
  useDocument,
  type ThemeColor,
  type YextComponentConfig,
  type YextFields,
  getAggregateRating,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  getReadableTextColor,
  getTextStyles,
  getThemeColorCssValue,
  type StyledTextProps,
  getSurfaceColorStyle,
} from "../shared/sectionHelpers";

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
    title: {
      label: msg("fields.title", "Title"),
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
    reviewColor: {
      label: msg("fields.reviewColor", "Review Color"),
      type: "basicSelector",
      options: "SITE_COLOR",
    },
  };

const reviewsCss = `
  .luxury-reviews {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    width: 100%;
    margin: 0;
  }

  .luxury-reviews__inner {
    width: 100%;
    max-width: var(--maxWidth-pageSection-contentWidth);
    margin: 0 auto;
  }

  .luxury-reviews__title {
    margin: 0 0 16px;

    text-align: center;
  }

  .luxury-reviews__summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin: 0 0 48px;
  }

  .luxury-reviews__list {
    display: grid;
    gap: 28px;
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
  }

  .luxury-reviews__rating {
    display: inline-flex;
    align-items: baseline;
    gap: 14px;
    margin: 0;
  }

  .luxury-reviews__copy {
    margin: 0;
  }

  @media (max-width: 720px) {
    .luxury-reviews {
    padding: var(--padding-pageSection-verticalPadding) 1rem;
    }

    .luxury-reviews__inner {
      width: 100%;
      max-width: var(--maxWidth-pageSection-contentWidth);
    }

    .luxury-reviews__summary {
      flex-wrap: wrap;
      gap: 10px;
  }
  }
`;

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
  const { t } = useTranslation();
  const streamDocument = useDocument<
    ReviewStreamDocument & Record<string, unknown>
  >();
  const locale = streamDocument.locale ?? "en";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const title =
    resolveComponentData(props.title.text, locale, streamDocument) || "";
  const readableTextColor = getReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const titleStyle = getTextStyles(
    props.title.styles,
    props.title.fontColor,
    readableTextColor,
  );
  const sectionStyle = getSurfaceColorStyle(
    props.section?.backgroundColor,
    streamDocument,
  );
  const reviewColor =
    getThemeColorCssValue(props.reviewColor) ?? readableTextColor;

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
          <Background
            as="section"
            background={props.section.backgroundColor}
            className="luxury-reviews"
            style={sectionStyle}
          >
            <div className="luxury-reviews__inner">
              <EntityField
                displayName={pt("fields.title", "Title")}
                fieldId={props.title.text.field}
                constantValueEnabled={props.title.text.constantValueEnabled}
              >
                <h2 className="luxury-reviews__title" style={titleStyle}>
                  {title}
                </h2>
              </EntityField>
              {!reviews.length && props.puck.isEditing ? (
                <p>{pt("noFirstPartyReviews", "No first-party reviews")}</p>
              ) : null}
            </div>
          </Background>
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
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-reviews"
          style={sectionStyle}
        >
          <div className="luxury-reviews__inner">
            <EntityField
              displayName={pt("fields.title", "Title")}
              fieldId={props.title.text.field}
              constantValueEnabled={props.title.text.constantValueEnabled}
            >
              <h2 className="luxury-reviews__title" style={titleStyle}>
                {title}
              </h2>
            </EntityField>
            <p
              className="luxury-reviews__summary"
              aria-label={t("customerRatingSummary", "Customer rating summary")}
              style={{ color: reviewColor }}
            >
              <span>{averageRating.toFixed(1)}</span>
              <span aria-hidden="true">
                {"★".repeat(
                  Math.max(0, Math.min(5, Math.round(averageRating))),
                )}
              </span>
              <span>|</span>
              <span>
                {t("reviewWithCount", {
                  defaultValue: "{{count}} Reviews",
                  count: reviewCount,
                })}
              </span>
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
                      {review.authorName || t("reviewer", "Reviewer")}
                    </h3>
                    <p
                      className="luxury-reviews__rating"
                      style={{ color: reviewColor }}
                    >
                      <span aria-hidden="true">
                        {"★".repeat(Math.round(review.rating ?? 5))}
                      </span>
                      <span>
                        {t(
                          "ratingOutOfFiveStars",
                          "{{rating}}/5 stars",
                          { rating: review.rating ?? 5 },
                        )}
                      </span>
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
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailReviewsSection: YextComponentConfig<LuxuryRetailReviewsSectionProps> =
  {
    label: msg("components.reviewsSection", "Reviews Section"),
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
          textTransform: "default",
        },
        fontColor: undefined,
      },
      reviewColor: undefined,
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
