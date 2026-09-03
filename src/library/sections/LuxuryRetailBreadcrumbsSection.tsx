import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  EntityField,
  VisibilityWrapper,
  getAnalyticsScopeHash,
  isDarkColor,
  resolveBreadcrumbs,
  resolveComponentData,
  useDocument,
  useTemplateProps,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type LuxuryRetailBreadcrumbsSectionProps = {
  rootLabel: StyledTextProps;
  currentPage: StyledTextProps;
  includeCurrentLocation: boolean;
  separator: string;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

type StreamDocumentValue = Record<string, unknown> & {
  locale?: string;
  name?: string;
  address?: {
    line1?: string;
  };
};

const LuxuryRetailBreadcrumbsSectionFields: YextFields<LuxuryRetailBreadcrumbsSectionProps> =
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
    rootLabel: {
      label: "Root Label",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.string"],
          },
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
    currentPage: {
      label: "Current Page",
      type: "object",
      objectFields: {
        text: {
          type: "entityField",
          label: "Text",
          filter: {
            types: ["type.string"],
          },
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
    includeCurrentLocation: {
      label: "Include Current Location",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    separator: {
      label: "Separator",
      type: "text",
    },
  };

const resolveThemeColorCssValue = (color?: ThemeColor): string | undefined => {
  if (!color?.selectedColor || color.selectedColor === "default") {
    return undefined;
  }

  const customColorMatch = color.selectedColor.match(
    /^\[(#[0-9A-Fa-f]{3,8})\]$/,
  );
  if (customColorMatch) {
    return customColorMatch[1].toUpperCase();
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

const getReadableTextColor = (
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
      : "#111111")
  );
};

const getTextStyles = (
  props: StyledTextProps,
  fallbackColor: string,
): React.CSSProperties => {
  return {
    color: resolveThemeColorCssValue(props.fontColor) ?? fallbackColor,
    fontFamily:
      props.styles.fontFamily === "default"
        ? undefined
        : props.styles.fontFamily,
    fontSize:
      props.styles.fontSize === "default" ? undefined : props.styles.fontSize,
    fontWeight:
      props.styles.fontWeight === "default"
        ? undefined
        : props.styles.fontWeight,
    fontStyle:
      props.styles.fontStyle === "default" ? undefined : props.styles.fontStyle,
    textTransform:
      props.styles.textTransform === "default"
        ? undefined
        : props.styles.textTransform,
  };
};

const breadcrumbsCss = `
  .luxury-breadcrumbs {
    width: 100%;
    margin: 0;
  }

  .luxury-breadcrumbs__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
  }

  .luxury-breadcrumbs__nav {
    padding: 18px 0 20px;
  }

  .luxury-breadcrumbs__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .luxury-breadcrumbs__item {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .luxury-breadcrumbs__link,
  .luxury-breadcrumbs__current {
  font-family: var(--fontFamily-body-fontFamily);
  font-size: var(--fontSize-body-fontSize);
  line-height: 1.5;
  font-weight: var(--fontWeight-body-fontWeight);
  font-style: var(--fontStyle-body-fontStyle);
  text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-breadcrumbs__link {
    opacity: 0.76;
    transition: opacity 0.18s ease, transform 0.18s ease;
  }

  .luxury-breadcrumbs__link:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  .luxury-breadcrumbs__current {
    opacity: 1;
  }

  .luxury-breadcrumbs__separator {
    opacity: 0.35;
    font-size: 10px;
    line-height: 1;
  }

  @media (max-width: 900px) {
    .luxury-breadcrumbs__inner {
      width: min(1760px, calc(100vw - 40px));
    }

    .luxury-breadcrumbs__nav {
      padding: 16px 0 18px;
    }
  }

  @media (max-width: 640px) {
    .luxury-breadcrumbs__list {
      gap: 6px 10px;
    }

    .luxury-breadcrumbs__link,
    .luxury-breadcrumbs__current {
      font-size: 10px;
      letter-spacing: 0.14em;
    }
  }
`;

const LuxuryRetailBreadcrumbsSectionComponent: PuckComponent<
  LuxuryRetailBreadcrumbsSectionProps
> = (props) => {
  const streamDocument = useDocument() as StreamDocumentValue;
  const { relativePrefixToRoot } = useTemplateProps();
  const locale = streamDocument.locale ?? "en";
  const breadcrumbItems = resolveBreadcrumbs(streamDocument) ?? [];
  const visibleBreadcrumbs =
    props.includeCurrentLocation || breadcrumbItems.length <= 1
      ? breadcrumbItems
      : breadcrumbItems.slice(0, -1);

  if (!visibleBreadcrumbs.length) {
    return props.puck.isEditing ? (
      <p
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "18px 24px",
        }}
      >
        No breadcrumbs available (section will be hidden on live page). Create a
        directory to enable breadcrumbs.
      </p>
    ) : (
      <></>
    );
  }

  const sectionBackgroundColor = resolveThemeColorCssValue(
    props.section.backgroundColor,
  );
  const rootTextColor = getReadableTextColor(
    props.rootLabel.fontColor,
    props.section.backgroundColor,
    streamDocument,
  );
  const currentTextColor = getReadableTextColor(
    props.currentPage.fontColor,
    props.section.backgroundColor,
    streamDocument,
  );
  const rootTextStyle = getTextStyles(props.rootLabel, rootTextColor);
  const currentTextStyle = getTextStyles(props.currentPage, currentTextColor);
  const rootLabelValue =
    resolveComponentData(props.rootLabel.text, locale, streamDocument) || "";
  const currentPageLabel =
    resolveComponentData(props.currentPage.text, locale, streamDocument) ||
    streamDocument.name ||
    streamDocument.address?.line1 ||
    "";

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailBreadcrumbsSection${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <section
          className="luxury-breadcrumbs"
          style={{ backgroundColor: sectionBackgroundColor }}
        >
          <style>{breadcrumbsCss}</style>
          <div className="luxury-breadcrumbs__inner">
            <nav className="luxury-breadcrumbs__nav" aria-label="Breadcrumb">
              <ol className="luxury-breadcrumbs__list">
                {visibleBreadcrumbs.map((breadcrumb, index) => {
                  const isRoot = index === 0;
                  const isCurrent = index === visibleBreadcrumbs.length - 1;
                  const href = relativePrefixToRoot
                    ? `${relativePrefixToRoot}${breadcrumb.slug}`
                    : breadcrumb.slug;
                  const label = isRoot
                    ? rootLabelValue || breadcrumb.name
                    : isCurrent && props.includeCurrentLocation
                      ? currentPageLabel || breadcrumb.name
                      : breadcrumb.name;

                  const content =
                    isCurrent && props.includeCurrentLocation ? (
                      <span
                        className="luxury-breadcrumbs__current"
                        style={currentTextStyle}
                      >
                        {label}
                      </span>
                    ) : (
                      <Link
                        cta={{
                          link: href,
                          linkType: "URL",
                        }}
                        eventName={`breadcrumbLink${index}`}
                        className="luxury-breadcrumbs__link"
                        style={isRoot ? rootTextStyle : rootTextStyle}
                      >
                        {label}
                      </Link>
                    );

                  return (
                    <li
                      key={`${breadcrumb.slug}-${index}`}
                      className="luxury-breadcrumbs__item"
                    >
                      {!isRoot ? (
                        <span
                          className="luxury-breadcrumbs__separator"
                          aria-hidden="true"
                        >
                          {props.separator}
                        </span>
                      ) : null}
                      {isRoot ? (
                        <EntityField
                          displayName="Root Label"
                          fieldId={props.rootLabel.text.field}
                          constantValueEnabled={
                            props.rootLabel.text.constantValueEnabled
                          }
                        >
                          {content}
                        </EntityField>
                      ) : isCurrent && props.includeCurrentLocation ? (
                        <EntityField
                          displayName="Current Page"
                          fieldId={props.currentPage.text.field}
                          constantValueEnabled={
                            props.currentPage.text.constantValueEnabled
                          }
                        >
                          {content}
                        </EntityField>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </section>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailBreadcrumbsSection: YextComponentConfig<LuxuryRetailBreadcrumbsSectionProps> =
  {
    label: "Breadcrumbs Section",
    fields: LuxuryRetailBreadcrumbsSectionFields,
    defaultProps: {
      rootLabel: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "All Locations",
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "11px",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "uppercase",
        },
        fontColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      currentPage: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "",
          },
          constantValueEnabled: false,
        },
        styles: {
          fontFamily: "default",
          fontSize: "11px",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "uppercase",
        },
        fontColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
      includeCurrentLocation: true,
      separator: "/",
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        visibleOnLivePage: true,
      },
    },
    render: (props) => (
      <LuxuryRetailBreadcrumbsSectionComponent {...props} />
    ),
  };

export const config: SectionConfig = {
  id: "LuxuryRetailBreadcrumbsSection",
  displayName: "Breadcrumbs Section",
  description: "Breadcrumbs Section",
  pageSetTypes: ["ENTITY"],
};
