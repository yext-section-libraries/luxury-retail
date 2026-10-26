import "../shared/typography.css";
import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  msg,
  Background,
  pt,
  createItemSource,
  EntityField,
  getDefaultRTF,
  resolveComponentData,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  getAnalyticsScopeHash,
  toPuckFields,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableRichText,
  type TranslatableString,
  type YextEntityField,
  useDocument,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import {
  getReadableTextColor,
  getTextStyles,
  getThemeColorCssValue,
  renderResolvedRichText,
  type StyledTextProps,
  getSurfaceColorStyle,
} from "../shared/sectionHelpers";

type FaqItemFields = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

function createFaqItem(question: string, answer: string): FaqItemFields {
  return {
    question: {
      field: "",
      constantValue: {
        defaultValue: question,
      },
      constantValueEnabled: true,
    },
    answer: {
      field: "",
      constantValue: {
        defaultValue: getDefaultRTF(answer),
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
  };
}

const faqItemsSource = createItemSource<FaqItemFields>({
  label: msg("fields.items", "Items"),
  mappingFields: {
    question: {
      type: "entityField",
      label: msg("fields.question", "Question"),
      filter: {
        types: ["type.string"],
      },
    },
    answer: {
      type: "entityField",
      label: msg("fields.answer", "Answer"),
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
  defaultValues: [
    createFaqItem(
      "Do I need an appointment for a stylist?",
      "Walk-ins are welcome, but we recommend booking an appointment in advance to ensure a dedicated stylist and a prepared fitting room.",
    ),
    createFaqItem(
      "Where is the best place to park?",
      "Validated garage parking is available nearby, and metered street parking is available on Halsted and Armitage.",
    ),
    createFaqItem(
      "Can I return items I bought online at this store?",
      "Yes. Bring your order confirmation or packing slip and our team can process eligible online returns in-store.",
    ),
    createFaqItem(
      "Do you offer contactless pickup?",
      "Yes. Place your order online and choose in-store pickup during checkout to receive collection instructions.",
    ),
    createFaqItem(
      "Is tailoring available for clothes bought elsewhere?",
      "Basic hemming and fit adjustments are available for most garments. Ask the store team for current pricing and turnaround.",
    ),
  ],
});

type LuxuryRetailFaqSectionProps = {
  heading: StyledTextProps;
  items: {
    data: typeof faqItemsSource.value;
    styles: {
      question: Omit<StyledTextProps, "text">;
      answer: Omit<StyledTextProps, "text">;
    };
  };
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const LuxuryRetailFaqSectionFields: YextFields<LuxuryRetailFaqSectionProps> =
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
          label: msg("fields.text", "Text"),
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        },
        styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
        fontColor: {
          label: msg("fields.fontColor", "Font Color"),
          type: "basicSelector",
          options: "SITE_COLOR",
        },
      },
    },
    items: {
      label: msg("fields.items", "Items"),
      type: "object",
      objectFields: {
        data: faqItemsSource.field,
        styles: {
          label: msg("fields.styles", "Styles"),
          type: "object",
          objectFields: {
            question: {
              label: msg("fields.question", "Question"),
              type: "object",
              objectFields: {
                styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
                fontColor: {
                  label: msg("fields.fontColor", "Font Color"),
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
              },
            },
            answer: {
              label: msg("fields.answer", "Answer"),
              type: "object",
              objectFields: {
                styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
                fontColor: {
                  label: msg("fields.fontColor", "Font Color"),
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
              },
            },
          },
        },
      },
    },
  };

const LuxuryRetailFaqSectionComponent: PuckComponent<
  LuxuryRetailFaqSectionProps
> = (props) => {
  const analytics = useAnalytics();
  const streamDocument = useDocument<
    Record<string, unknown> & { locale?: string }
  >();
  const locale = streamDocument.locale ?? "en";
  const resolvedItems = faqItemsSource.resolveItems(
    props.items.data,
    streamDocument,
  );
  const [openIndex, setOpenIndex] = React.useState(
    resolvedItems.length > 0 ? 0 : -1,
  );
  const resolvedHeading =
    resolveComponentData(props.heading.text, locale, streamDocument) || "";
  const readableTextColor = getReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const headingStyle = getTextStyles(
    props.heading.styles,
    props.heading.fontColor,
    readableTextColor,
  );
  const rowBorderColor =
    getThemeColorCssValue({
      selectedColor: props.section?.backgroundColor.contrastingColor,
      contrastingColor: props.section?.backgroundColor.selectedColor,
    }) ?? "var(--colors-palette-tertiary)";
  const sectionStyle = getSurfaceColorStyle(
    props.section?.backgroundColor,
    streamDocument,
  );

  return (
    <VisibilityWrapper
      liveVisibility={props.section.visibleOnLivePage}
      isEditing={props.puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`LuxuryRetailFaqSection${getAnalyticsScopeHash(props.id)}`}
      >
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-faq px-4 md:px-6 py-pageSection-verticalPadding"
          style={sectionStyle}
        >
          <div className="mx-auto flex w-full max-w-pageSection-contentWidth flex-col gap-8">
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="m-0 text-center"
                style={headingStyle}
              >
                {resolvedHeading}
              </h2>
            </EntityField>
            <EntityField
              displayName={pt("fields.items", "Items")}
              fieldId={props.items.data.field}
              constantValueEnabled={props.items.data.constantValueEnabled}
            >
              <div
                className="grid gap-0 border-y"
                style={{ borderColor: rowBorderColor }}
              >
                {resolvedItems.map((item, index) => {
                  const isOpen = openIndex === index;
                  const resolvedQuestion = item.question
                    ? resolveComponentData(
                        item.question,
                        locale,
                        streamDocument,
                      ) || ""
                    : "";
                  const questionStyle = getTextStyles(
                    props.items.styles.question.styles,
                    props.items.styles.question.fontColor,
                    readableTextColor,
                  );
                  const answerStyleOverrides = {
                    ...props.items.styles.answer.styles,
                    color:
                      getThemeColorCssValue(
                        props.items.styles.answer.fontColor,
                      ) ?? readableTextColor,
                  };
                  const resolvedAnswer = item.answer
                    ? resolveComponentData(item.answer, locale, streamDocument)
                    : undefined;

                  return (
                    <div
                      key={`${resolvedQuestion}-${index}`}
                      className="border-b last:border-b-0"
                      style={{
                        backgroundColor: sectionStyle?.backgroundColor,
                        borderColor: rowBorderColor,
                      }}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-6 px-0 py-5 text-left"
                        onClick={() => {
                          const nextIsOpen = !isOpen;
                          setOpenIndex(nextIsOpen ? index : -1);
                          analytics?.track({
                            action: nextIsOpen ? "EXPAND" : "COLLAPSE",
                            eventName: `toggle${index}`,
                          });
                        }}
                      >
                        <span
                          className="luxury-retail-faq-label"
                          style={questionStyle}
                        >
                          {resolvedQuestion}
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0"
                          style={{ color: questionStyle.color }}
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen ? (
                        <div
                          className="pb-5 pr-10"
                          style={{ color: answerStyleOverrides.color }}
                        >
                          {renderResolvedRichText(
                            resolvedAnswer,
                            answerStyleOverrides,
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const LuxuryRetailFaqSection: YextComponentConfig<LuxuryRetailFaqSectionProps> =
  {
    label: msg("components.faqSection", "FAQ Section"),
    fields: toPuckFields<LuxuryRetailFaqSectionProps>(
      LuxuryRetailFaqSectionFields,
    ),
    defaultProps: {
      heading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Frequently Asked Questions",
          },
          constantValueEnabled: true,
        },
        fontColor: undefined,
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      },
      items: {
        data: faqItemsSource.defaultValue,
        styles: {
          question: {
            styles: defaultTextStyles,
            fontColor: undefined,
          },
          answer: {
            styles: defaultTextStyles,
            fontColor: undefined,
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
    render: (props) => <LuxuryRetailFaqSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailFaqSection",
  displayName: "FAQ Section",
  description: "FAQ Section",
  pageSetTypes: ["ENTITY"],
};
