import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import {
  msg,
  pt,
  Background,
  ComprehensiveCTA,
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveComponentData,
  useDocument,
  type ComprehensiveCTAValue,
  type StyledTextValue,
  type ThemeColor,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  Address,
  AnalyticsScopeProvider,
  HoursTable,
  Link,
  type AddressType,
  type DayOfWeekNames,
  type HoursType,
} from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import {
  formatPhoneNumber,
  getReadableTextColor as resolveReadableTextColor,
  getReadableThemeColor as resolveReadableThemeColor,
  getTextStyles as resolveTextStyles,
  getThemeColorCssValue as resolveThemeColorCssValue,
  type StyledTextProps,
} from "../shared/sectionHelpers";

type PhoneItemProps = {
  number: YextEntityField<string>;
  label: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type StyledTextListProps = {
  text: YextEntityField<TranslatableString[]>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type HoursStyles = {
  startOfWeek: keyof DayOfWeekNames | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center" | "items-end";
};

type LuxuryRetailStoreDetailsSectionProps = {
  title: StyledTextProps;
  locationInformationHeading: StyledTextProps;
  addressHeading: StyledTextProps;
  mainPhoneHeading: StyledTextProps;
  storeHoursHeading: StyledTextProps;
  servicesHeading: StyledTextProps;
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
  phones: PhoneFieldProps;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
  hours: YextEntityField<HoursType>;
  hoursStyles: HoursStyles;
  services: StyledTextListProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const LuxuryRetailStoreDetailsSectionFields: YextFields<
  LuxuryRetailStoreDetailsSectionProps
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
  title: {
    label: msg("fields.title", "Title"),
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
  locationInformationHeading: {
    label: msg("fields.locationInformationHeading", "Location Information Heading"),
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
  addressHeading: {
    label: msg("fields.addressHeading", "Address Heading"),
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
  address: {
    type: "entityField",
    label: msg("fields.address", "Address"),
    filter: {
      types: ["type.address"],
    },
  },
  showRegion: {
    label: msg("fields.showRegion", "Show Region"),
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  },
  showCountry: {
    label: msg("fields.showCountry", "Show Country"),
    type: "radio",
    options: [
      { label: msg("fields.options.yes", "Yes"), value: true },
      { label: msg("fields.options.no", "No"), value: false },
    ],
  },
  mainPhoneHeading: {
    label: msg("fields.mainPhoneHeading", "Main Phone Heading"),
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
  phones: {
    label: msg("fields.phones", "Phones"),
    type: "object",
    objectFields: {
      items: {
        label: msg("fields.items", "Items"),
        type: "array",
        arrayFields: {
          number: {
            type: "entityField",
            label: msg("fields.number", "Number"),
            filter: {
              types: ["type.phone"],
            },
          },
          label: {
            label: msg("fields.label", "Label"),
            type: "text",
          },
        },
        defaultItemProps: {
          number: {
            field: "",
            constantValue: "",
            constantValueEnabled: true,
          },
          label: "",
        },
        getItemSummary: (item) =>
          item.label || item.number?.field || item.number?.constantValue || "Phone",
      },
      phoneFormat: {
        label: msg("fields.phoneFormat", "Phone Format"),
        type: "radio",
        options: [
          { label: msg("fields.options.domestic", "Domestic"), value: "domestic" },
          { label: msg("fields.options.international", "International"), value: "international" },
        ],
      },
      includeHyperlink: {
        label: msg("fields.includeHyperlink", "Include Hyperlink"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
    },
  },
  storeHoursHeading: {
    label: msg("fields.storeHoursHeading", "Store Hours Heading"),
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
      startOfWeek: {
        label: msg("fields.startOfWeek", "Start Of Week"),
        type: "select",
        options: [
          { label: msg("monday", "Monday"), value: "monday" },
          { label: msg("tuesday", "Tuesday"), value: "tuesday" },
          { label: msg("wednesday", "Wednesday"), value: "wednesday" },
          { label: msg("thursday", "Thursday"), value: "thursday" },
          { label: msg("friday", "Friday"), value: "friday" },
          { label: msg("saturday", "Saturday"), value: "saturday" },
          { label: msg("sunday", "Sunday"), value: "sunday" },
          { label: msg("fields.options.today", "Today"), value: "today" },
        ],
      },
      collapseDays: {
        label: msg("fields.collapseDays", "Collapse Days"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      showAdditionalHoursText: {
        label: msg("fields.showAdditionalHoursText", "Show Additional Hours Text"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      alignment: {
        label: msg("fields.alignment", "Alignment"),
        visible: false,
        type: "select",
        options: [
          { label: msg("fields.options.start", "Start"), value: "items-start" },
          { label: msg("fields.options.center", "Center"), value: "items-center" },
          { label: msg("fields.options.end", "End"), value: "items-end" },
        ],
      },
    },
  },
  servicesHeading: {
    label: msg("fields.servicesHeading", "Services Heading"),
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
  primaryCta: {
    label: msg("fields.primaryCTA", "Primary CTA"),
    type: "comprehensiveCTA",
  },
  secondaryCta: {
    label: msg("fields.secondaryCTA", "Secondary CTA"),
    type: "comprehensiveCTA",
  },
  services: {
    label: msg("fields.services", "Services"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.textList", "Text List"),
        filter: {
          types: ["type.string"],
          includeListsOnly: true,
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
};

const detailsCss = `
  .luxury-store-details :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-store-details :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-store-details :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-store-details :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-store-details :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-store-details :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-store-details :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-store-details :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-store-details :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-store-details {
    width: 100%;
    margin: 0;
    padding: 48px 0;
  }

  .luxury-store-details__inner {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
  }

  .luxury-store-details__content {
    display: grid;
    gap: 40px;
  }

  .luxury-store-details__title {
    margin: 0;
    color: var(--luxury-store-details-title-color);
    font-family: var(--fontFamily-h3-fontFamily, Georgia, serif);
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;
  }

  .luxury-store-details__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 48px;
  }

  .luxury-store-details__card {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .luxury-store-details__card--hours {
    padding-right: 48px;
  }

  .luxury-store-details__card-title,
  .luxury-store-details__label {
    margin: 0;
    color: var(--luxury-store-details-heading-color);
    font-family: var(--fontFamily-h4-fontFamily, Georgia, serif);
    font-weight: 400;
  }

  .luxury-store-details__card-title {
    margin-bottom: 22px;
    font-size: 21px;
    line-height: 1.18;
  }

  .luxury-store-details__stack {
    display: grid;
    gap: 26px;
  }

  .luxury-store-details__block {
    display: grid;
    gap: 12px;
  }

  .luxury-store-details__label {
    font-size: 14px;
    letter-spacing: 0.12em;
    line-height: 1.3;
    text-transform: uppercase;
  }

  .luxury-store-details__block,
  .luxury-store-details__phones,
  .luxury-store-details__hours,
  .luxury-store-details__services {
    color: var(--luxury-store-details-readable-color);
    font-size: 15px;
    line-height: 1.6;
  }

  .luxury-store-details__phones {
    display: grid;
    gap: 8px;
  }

  .luxury-store-details__phone-link {
    color: var(--luxury-store-details-phone-link-color);
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }

  .luxury-store-details__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 24px;
    margin-top: auto;
    padding-top: 28px;
  }

  .luxury-store-details__cta {
    display: inline-flex;
    align-items: center;
    position: relative;
    text-decoration: none;
    transition: transform 0.18s ease;
  }

  .luxury-store-details__cta--button {
    justify-content: center;
    min-height: 48px;
    padding: 0 24px;
  }

  .luxury-store-details__cta--underlined {
    gap: 8px;
    padding: 8px 12px 8px 0;
  }

  .luxury-store-details__cta--underlined::after {
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

  .luxury-store-details__cta--underlined:hover,
  .luxury-store-details__cta--underlined:focus-visible {
    transform: translateX(4px);
  }

  .luxury-store-details__cta--underlined:hover::after,
  .luxury-store-details__cta--underlined:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  .luxury-store-details__hours .HoursTable {
    display: grid;
    gap: 8px;
  }

  .luxury-store-details__hours .HoursTable-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: baseline;
  }

  .luxury-store-details__hours .HoursTable-day {
    color: var(--luxury-store-details-hours-color);
  }

  .luxury-store-details__hours .HoursTable-intervals {
    text-align: right;
  }

  .luxury-store-details__hours .HoursTable-row.is-today .HoursTable-day,
  .luxury-store-details__hours .HoursTable-row.is-today .HoursTable-intervals {
    color: var(--luxury-store-details-hours-color);
    font-weight: 700;
  }

  .luxury-store-details__services {
    display: grid;
    gap: 8px;
    padding-left: 1.2em;
    list-style: disc;
  }

  .luxury-store-details__services li::marker {
    color: var(--luxury-store-details-services-color);
  }

  @media (max-width: 1100px) {
    .luxury-store-details {
      padding: 32px 0;
    }

    .luxury-store-details__inner {
      width: calc(100vw - 40px);
    }
  }

  @media (max-width: 1020px) {
    .luxury-store-details__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .luxury-store-details__card--services {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 720px) {
    .luxury-store-details__content {
      gap: 32px;
    }

    .luxury-store-details__grid {
      grid-template-columns: 1fr;
    }

    .luxury-store-details__card--hours {
      padding-right: 0;
    }

    .luxury-store-details__card--services {
      grid-column: auto;
    }
  }
`;

const LuxuryRetailStoreDetailsSectionComponent: PuckComponent<
  LuxuryRetailStoreDetailsSectionProps
> = ({ id, puck, ...props }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const dayOfWeekNames: DayOfWeekNames = {
    monday: t("monday", "Monday"),
    tuesday: t("tuesday", "Tuesday"),
    wednesday: t("wednesday", "Wednesday"),
    thursday: t("thursday", "Thursday"),
    friday: t("friday", "Friday"),
    saturday: t("saturday", "Saturday"),
    sunday: t("sunday", "Sunday"),
  };
  const streamDocument = useDocument<Record<string, unknown>>();
  const resolvedTitle =
    resolveComponentData(props.title.text, locale, streamDocument) || "";
  const resolvedLocationInformationHeading =
    resolveComponentData(
      props.locationInformationHeading.text,
      locale,
      streamDocument,
    ) || "";
  const resolvedAddressHeading =
    resolveComponentData(props.addressHeading.text, locale, streamDocument) || "";
  const resolvedMainPhoneHeading =
    resolveComponentData(props.mainPhoneHeading.text, locale, streamDocument) || "";
  const resolvedStoreHoursHeading =
    resolveComponentData(props.storeHoursHeading.text, locale, streamDocument) || "";
  const resolvedServicesHeading =
    resolveComponentData(props.servicesHeading.text, locale, streamDocument) || "";
  const resolvedAddress = resolveComponentData(
    props.address,
    locale,
    streamDocument,
  );
  const resolvedServices = (
    resolveComponentData(props.services.text, locale, streamDocument) || []
  ).map((item) => {
    if (typeof item === "string") {
      return item;
    }

    return item.defaultValue ?? "";
  });
  const resolvedHours = resolveComponentData(
    props.hours,
    locale,
    streamDocument,
  );
  const additionalHoursText =
    typeof streamDocument.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";
  const resolvedPhoneItems = (props.phones.items ?? []).reduce<
    Array<{
      label: string;
      originalNumber: string;
      formattedNumber: string;
      telDigits: string;
      fieldId: string;
      constantValueEnabled: boolean | undefined;
    }>
  >((items, item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const normalizedNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";

      if (!normalizedNumber) {
        return items;
      }

      items.push({
        label: item.label.trim(),
        originalNumber: normalizedNumber,
        formattedNumber: formatPhoneNumber(
          normalizedNumber,
          props.phones.phoneFormat,
        ),
        telDigits: normalizedNumber.replace(/\D/g, ""),
        fieldId: item.number.field,
        constantValueEnabled: item.number.constantValueEnabled,
      });

      return items;
    }, []);
  const readableTextColor = resolveReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const titleStyle: React.CSSProperties = {
    ...resolveTextStyles(props.title.styles),
    color: resolveThemeColorCssValue(props.title.fontColor) ?? readableTextColor,
  };
  const locationInformationHeadingStyle: React.CSSProperties = {
    ...resolveTextStyles(props.locationInformationHeading.styles),
    color:
      resolveThemeColorCssValue(props.locationInformationHeading.fontColor) ??
      readableTextColor,
  };
  const addressHeadingStyle: React.CSSProperties = {
    ...resolveTextStyles(props.addressHeading.styles),
    color:
      resolveThemeColorCssValue(props.addressHeading.fontColor) ??
      readableTextColor,
  };
  const mainPhoneHeadingStyle: React.CSSProperties = {
    ...resolveTextStyles(props.mainPhoneHeading.styles),
    color:
      resolveThemeColorCssValue(props.mainPhoneHeading.fontColor) ??
      readableTextColor,
  };
  const storeHoursHeadingStyle: React.CSSProperties = {
    ...resolveTextStyles(props.storeHoursHeading.styles),
    color:
      resolveThemeColorCssValue(props.storeHoursHeading.fontColor) ??
      readableTextColor,
  };
  const servicesHeadingStyle: React.CSSProperties = {
    ...resolveTextStyles(props.servicesHeading.styles),
    color:
      resolveThemeColorCssValue(props.servicesHeading.fontColor) ??
      readableTextColor,
  };
  const servicesStyle: React.CSSProperties = {
    ...resolveTextStyles(props.services.styles),
    color: resolveThemeColorCssValue(props.services.fontColor) ?? readableTextColor,
  };
  const servicesItemStyle: React.CSSProperties = {
    textTransform: servicesStyle.textTransform,
  };
  const getCtaClassName = (variant: ComprehensiveCTAValue["styles"]["variant"]) =>
    `luxury-store-details__cta ${
      variant === "link"
        ? "luxury-store-details__cta--underlined"
        : "luxury-store-details__cta--button"
    }`;
  const primaryCtaColor = resolveReadableThemeColor(
    props.primaryCta.styles.color,
    props.section?.backgroundColor,
    streamDocument,
    props.primaryCta.styles.variant,
  );
  const secondaryCtaColor = resolveReadableThemeColor(
    props.secondaryCta.styles.color,
    props.section?.backgroundColor,
    streamDocument,
    props.secondaryCta.styles.variant,
  );
  const sectionStyle = {
    ...getSurfaceColorStyle(props.section?.backgroundColor, streamDocument),
    "--luxury-store-details-title-color": titleStyle.color,
    "--luxury-store-details-heading-color":
      locationInformationHeadingStyle.color,
    "--luxury-store-details-readable-color": readableTextColor,
    "--luxury-store-details-phone-link-color": mainPhoneHeadingStyle.color,
    "--luxury-store-details-hours-color": storeHoursHeadingStyle.color,
    "--luxury-store-details-services-color": servicesStyle.color,
  } as React.CSSProperties;

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailStoreDetailsSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={puck.isEditing}
      >
        <style>{detailsCss}</style>
        <Background
          as="section"
          background={props.section.backgroundColor}
          className="luxury-store-details"
          style={sectionStyle}
        >
          <div className="luxury-store-details__inner">
          <div className="luxury-store-details__content">
            <EntityField
              displayName={pt("fields.title", "Title")}
              fieldId={props.title.text.field}
              constantValueEnabled={props.title.text.constantValueEnabled}
            >
              <h2
                className="luxury-store-details__title"
                style={titleStyle}
              >
                {resolvedTitle}
              </h2>
            </EntityField>

            <div className="luxury-store-details__grid">
              <article className="luxury-store-details__card">
                <EntityField
                  displayName={pt("fields.locationInformationHeading", "Location Information Heading")}
                  fieldId={props.locationInformationHeading.text.field}
                  constantValueEnabled={
                    props.locationInformationHeading.text.constantValueEnabled
                  }
                >
                  <h3
                    className="luxury-store-details__card-title"
                    style={locationInformationHeadingStyle}
                  >
                    {resolvedLocationInformationHeading}
                  </h3>
                </EntityField>
                <div className="luxury-store-details__stack">
                  <div className="luxury-store-details__block">
                    <EntityField
                      displayName={pt("fields.addressHeading", "Address Heading")}
                      fieldId={props.addressHeading.text.field}
                      constantValueEnabled={props.addressHeading.text.constantValueEnabled}
                    >
                      <h4 className="luxury-store-details__label" style={addressHeadingStyle}>
                        {resolvedAddressHeading}
                      </h4>
                    </EntityField>
                    {resolvedAddress ? (
                      <EntityField
                        displayName={pt("address", "Address")}
                        fieldId={props.address.field}
                        constantValueEnabled={props.address.constantValueEnabled}
                      >
                        <Address
                          address={resolvedAddress}
                          showRegion={props.showRegion}
                          showCountry={props.showCountry}
                        />
                      </EntityField>
                    ) : null}
                  </div>
                  <div className="luxury-store-details__block">
                    <EntityField
                      displayName={pt("fields.mainPhoneHeading", "Main Phone Heading")}
                      fieldId={props.mainPhoneHeading.text.field}
                      constantValueEnabled={props.mainPhoneHeading.text.constantValueEnabled}
                    >
                      <h4 className="luxury-store-details__label" style={mainPhoneHeadingStyle}>
                        {resolvedMainPhoneHeading}
                      </h4>
                    </EntityField>
                    <div className="luxury-store-details__phones">
                      {resolvedPhoneItems.map((item) => (
                        <EntityField
                          key={`${item.label}-${item.originalNumber}`}
                          displayName={pt("fields.phoneNumber", "Phone Number")}
                          fieldId={item.fieldId}
                          constantValueEnabled={item.constantValueEnabled}
                        >
                          {props.phones.includeHyperlink ? (
                            <Link
                              cta={{
                                link: item.telDigits,
                                linkType: "PHONE",
                              }}
                              eventName="contactPhone"
                              className="luxury-store-details__phone-link"
                              style={{ color: mainPhoneHeadingStyle.color }}
                            >
                              {item.label
                                ? `${item.label} ${item.formattedNumber}`
                                : item.formattedNumber}
                            </Link>
                          ) : (
                            <span>
                              {item.label
                                ? `${item.label} ${item.formattedNumber}`
                                : item.formattedNumber}
                            </span>
                          )}
                        </EntityField>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="luxury-store-details__actions">
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
              </article>

              <article className="luxury-store-details__card luxury-store-details__card--hours">
                <EntityField
                  displayName={pt("fields.storeHoursHeading", "Store Hours Heading")}
                  fieldId={props.storeHoursHeading.text.field}
                  constantValueEnabled={props.storeHoursHeading.text.constantValueEnabled}
                >
                  <h3
                    className="luxury-store-details__card-title"
                    style={storeHoursHeadingStyle}
                  >
                    {resolvedStoreHoursHeading}
                  </h3>
                </EntityField>
                <div
                  className={`luxury-store-details__hours flex flex-col ${props.hoursStyles.alignment}`}
                >
                  {resolvedHours ? (
                    <EntityField
                      displayName={pt("hours", "Hours")}
                      fieldId={props.hours.field}
                      constantValueEnabled={props.hours.constantValueEnabled}
                    >
                      <>
                        <HoursTable
                          hours={resolvedHours}
                          comingSoon={Boolean(streamDocument.comingSoon)}
                          dayOfWeekNames={dayOfWeekNames}
                          startOfWeek={props.hoursStyles.startOfWeek}
                          collapseDays={props.hoursStyles.collapseDays}
                          intervalTranslations={{
                            isClosed: t("closed", "Closed"),
                            open24Hours: t("open24Hours", "Open 24 Hours"),
                            reopenDate: t("reopenDate", "Reopen Date"),
                            timeFormatLocale: i18n.language,
                          }}
                        />
                        {props.hoursStyles.showAdditionalHoursText &&
                        additionalHoursText ? (
                          <p>{additionalHoursText}</p>
                        ) : null}
                      </>
                    </EntityField>
                  ) : null}
                </div>
              </article>

              <article className="luxury-store-details__card luxury-store-details__card--services">
                <EntityField
                  displayName={pt("fields.servicesHeading", "Services Heading")}
                  fieldId={props.servicesHeading.text.field}
                  constantValueEnabled={props.servicesHeading.text.constantValueEnabled}
                >
                  <h3
                    className="luxury-store-details__card-title"
                    style={servicesHeadingStyle}
                  >
                    {resolvedServicesHeading}
                  </h3>
                </EntityField>
                <EntityField
                  displayName={pt("services", "Services")}
                  fieldId={props.services.text.field}
                  constantValueEnabled={props.services.text.constantValueEnabled}
                >
                  <ul className="luxury-store-details__services" style={servicesStyle}>
                    {resolvedServices.map((item) => (
                      <li key={item} style={servicesItemStyle}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </EntityField>
              </article>
            </div>
          </div>
          </div>
        </Background>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailStoreDetailsSection: YextComponentConfig<LuxuryRetailStoreDetailsSectionProps> =
  {
    label: msg("fields.storeDetailsSection", "Store Details Section"),
    fields: LuxuryRetailStoreDetailsSectionFields,
    defaultProps: {
      title: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Lincoln Park Store Details",
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
      locationInformationHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Location Information",
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
      addressHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Address",
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
      mainPhoneHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Main Phone",
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
      storeHoursHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Store Hours",
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
      servicesHeading: {
        text: {
          field: "",
          constantValue: {
            defaultValue: "Services",
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
      address: {
        field: "address",
        constantValue: {
          line1: "",
          city: "",
          postalCode: "",
          countryCode: "",
          region: "",
        },
        constantValueEnabled: false,
      },
      showRegion: true,
      showCountry: false,
      phones: {
        items: [
          {
            number: {
              field: "mainPhone",
              constantValue: "",
              constantValueEnabled: false,
            },
            label: "",
          },
        ],
        phoneFormat: "domestic",
        includeHyperlink: true,
      },
      primaryCta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: {
                defaultValue: "Visit Website",
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
            borderRadius: "999px",
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
          variant: "link",
          color: undefined,
          link: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "uppercase",
            letterSpacing: "default",
            includeCaret: "default",
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
        startOfWeek: "today",
        collapseDays: false,
        showAdditionalHoursText: false,
        alignment: "items-start",
      },
      services: {
        text: {
          field: "",
          constantValue: [
            "Complimentary Personal Styling",
            "Digital Fitting Room Requests",
            "In-Store WiFi",
            "Mobile Checkout",
            "Gift Wrapping Station",
          ],
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
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
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
    render: (props) => <LuxuryRetailStoreDetailsSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailStoreDetailsSection",
  displayName: "Store Details Section",
  description: "Store Details Section",
  pageSetTypes: ["ENTITY"],
};
