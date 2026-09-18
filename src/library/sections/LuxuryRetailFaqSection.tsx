import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  msg,
  pt,
  Background,
  createItemSource,
  EntityField,
  getDefaultRTF,
  resolveComponentData,
  VisibilityWrapper,
  YextComponentConfig,
  YextFields,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
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

const faqCss = `
  .luxury-faq :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-faq :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-faq :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-faq :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-faq :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-faq :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-faq :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-faq :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-faq :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }
`;

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
        <style>{faqCss}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-faq px-6 py-16 min-[1101px]:px-[30px]"
          style={sectionStyle}
        >
          <div className="mx-auto flex w-[min(1120px,calc(100vw-60px))] flex-col gap-8">
            <EntityField
              displayName={pt("heading", "Heading")}
              fieldId={props.heading.text.field}
              constantValueEnabled={props.heading.text.constantValueEnabled}
            >
              <h2
                className="m-0 text-center text-[16px] uppercase tracking-[0.16em]"
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
                          className="font-serif text-[20px]"
                          style={questionStyle}
                        >
                          {resolvedQuestion}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-[20px]"
                          style={{ color: questionStyle.color }}
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen ? (
                        <div
                          className="pb-5 pr-10 text-[14px] leading-[1.7]"
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
    label: msg("components.faqSection", "Faq Section"),
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
            fontColor: {
              selectedColor: "palette-primary",
              contrastingColor: "palette-primary-contrast",
            },
          },
          answer: {
            styles: defaultTextStyles,
            fontColor: {
              selectedColor: "palette-quaternary",
              contrastingColor: "palette-quaternary-contrast",
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
    render: (props) => <LuxuryRetailFaqSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailFaqSection",
  displayName: "Faq Section",
  description: "Faq Section",
  pageSetTypes: ["ENTITY"],
};
