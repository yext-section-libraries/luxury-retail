import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  EntityField,
  getAnalyticsScopeHash,
  isDarkColor,
  msg,
  resolveComponentData,
  useDocument,
  type EnhancedTranslatableCTA,
  type ThemeColor,
  type YextComponentConfig,
  type YextCTAField,
  type YextEntityField,
  type YextFields,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  Address,
  AnalyticsScopeProvider,
  Link,
  type AddressType,
  type LinkType,
} from "@yext/pages-components";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaSnapchatGhost,
  FaTiktok,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type FooterLink = {
  cta: YextCTAField;
};

type SocialLink = FooterLink & {
  icon: "facebook" | "instagram" | "pinterest" | "snapchat" | "tiktok" | "x";
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label: string;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type LuxuryRetailFooterSectionProps = {
  footerLinks: FooterLink[];
  socialLinks: SocialLink[];
  websiteCta: YextCTAField;
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
  phones: PhoneFieldProps;
  fontColor?: ThemeColor;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

type StreamDocumentValue = Record<string, unknown> & { locale?: string };

function getCtaFieldDefault(
  label: string,
  link: string,
): YextCTAField {
  return {
    field: "",
    constantValue: {
      label: {
        defaultValue: label,
      },
      link: {
        defaultValue: link,
      },
      linkType: "URL",
    },
    constantValueEnabled: true,
    selectedType: "textAndLink",
  };
}

function getUnknownTranslatableStringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "defaultValue" in value &&
    typeof value.defaultValue === "string"
  ) {
    return value.defaultValue;
  }

  return "";
}

function getLinkTypeValue(value: unknown): LinkType | undefined {
  switch (value) {
    case "URL":
    case "Email":
    case "EMAIL":
    case "Phone":
    case "PHONE":
    case "DRIVING_DIRECTIONS":
    case "CLICK_TO_WEBSITE":
    case "OTHER":
      return value;
    default:
      return undefined;
  }
}

function getCtaSummary(
  cta: YextCTAField,
  fallback: string,
): string {
  const constantValue =
    typeof cta.constantValue === "object" && cta.constantValue !== null
      ? getUnknownTranslatableStringValue(cta.constantValue.label)
      : "";

  return constantValue || cta.field || fallback;
}

function getCtaLinkData(
  cta: YextCTAField,
  locale: string,
  streamDocument: StreamDocumentValue,
): {
  label: string;
  link: string;
  linkType: LinkType;
} {
  const resolvedValue = resolveComponentData(cta, locale, streamDocument) as
    | EnhancedTranslatableCTA
    | undefined;
  const label =
    resolvedValue !== undefined
      ? getUnknownTranslatableStringValue(resolvedValue.label)
      : "";
  const link =
    resolvedValue !== undefined
      ? getUnknownTranslatableStringValue(resolvedValue.link)
      : "";
  const fallbackLabel =
    typeof cta.constantValue === "object" && cta.constantValue !== null
      ? getUnknownTranslatableStringValue(cta.constantValue.label)
      : "";
  const fallbackLink =
    typeof cta.constantValue === "object" && cta.constantValue !== null
      ? getUnknownTranslatableStringValue(cta.constantValue.link)
      : "";
  const resolvedLinkType = getLinkTypeValue(resolvedValue?.linkType);
  const fallbackLinkType =
    typeof cta.constantValue === "object" && cta.constantValue !== null
      ? getLinkTypeValue(cta.constantValue.linkType)
      : undefined;

  return {
    label: label || fallbackLabel,
    link: link || fallbackLink || "#",
    linkType: resolvedLinkType ?? fallbackLinkType ?? "URL",
  };
}

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

const LuxuryRetailFooterSectionFields: YextFields<LuxuryRetailFooterSectionProps> =
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
    footerLinks: {
      label: "Footer Links",
      type: "array",
      arrayFields: {
        cta: {
          label: msg("fields.cta", "CTA"),
          type: "entityField",
          filter: {
            types: ["type.cta"],
          },
        },
      },
      defaultItemProps: {
        cta: getCtaFieldDefault("Link", "#"),
      },
      getItemSummary: (item) => getCtaSummary(item.cta, "Footer Link"),
    },
    socialLinks: {
      label: "Social Links",
      type: "array",
      arrayFields: {
        cta: {
          label: msg("fields.cta", "CTA"),
          type: "entityField",
          filter: {
            types: ["type.cta"],
          },
        },
        icon: {
          label: "Icon",
          type: "select",
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
            { label: "Pinterest", value: "pinterest" },
            { label: "Snapchat", value: "snapchat" },
            { label: "TikTok", value: "tiktok" },
            { label: "X", value: "x" },
          ],
        },
      },
      defaultItemProps: {
        cta: getCtaFieldDefault("Social", "#"),
        icon: "facebook",
      },
      getItemSummary: (item) => getCtaSummary(item.cta, "Social Link"),
    },
    websiteCta: {
      label: "Website Link",
      type: "entityField",
      filter: {
        types: ["type.cta"],
      },
    },
    address: {
      type: "entityField",
      label: "Address",
      filter: {
        types: ["type.address"],
      },
    },
    showRegion: {
      label: "Show Region",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    showCountry: {
      label: "Show Country",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    phones: {
      label: "Phones",
      type: "object",
      objectFields: {
        items: {
          label: "Items",
          type: "array",
          arrayFields: {
            number: {
              type: "entityField",
              label: "Number",
              filter: {
                types: ["type.phone"],
              },
            },
            label: {
              label: "Label",
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
          getItemSummary: (item) => item.label || "Phone",
        },
        phoneFormat: {
          label: "Phone Format",
          type: "radio",
          options: [
            { label: "Domestic", value: "domestic" },
            { label: "International", value: "international" },
          ],
        },
        includeHyperlink: {
          label: "Include Hyperlink",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
    },
    fontColor: {
      label: "Font Color",
      type: "basicSelector",
      options: "SITE_COLOR",
    },
  };

const footerCss = `
  .luxury-footer :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-footer :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-footer :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-footer :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-footer :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-footer :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-footer :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-footer :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-footer :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-footer-section {
    width: 100%;
  }

  .luxury-footer {
    width: min(1760px, calc(100vw - 60px));
    margin: 0 auto;
    padding: 48px 0;
  }

  .luxury-footer__connect {
    border-top-width: 1px;
    border-bottom-width: 1px;
    border-top-style: solid;
    border-bottom-style: solid;
  }

  .luxury-footer__connect-column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 48px;
  }

  .luxury-footer__links {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .luxury-footer__nav-link {
    display: inline-flex;
    position: relative;
    color: var(--luxury-footer-link-color);
    font-size: 12px;
    text-decoration: none;
    transition: color 0.18s ease;
  }

  .luxury-footer__nav-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 100%;
    height: 2px;
    background: currentColor;
    transform: scaleX(0.32);
    transform-origin: left center;
    opacity: 0;
    transition: transform 0.18s ease, opacity 0.18s ease;
  }

  .luxury-footer__nav-link:hover,
  .luxury-footer__nav-link:focus-visible {
    color: color-mix(in srgb, var(--luxury-footer-link-color) 82%, black);
  }

  .luxury-footer__nav-link:hover::after,
  .luxury-footer__nav-link:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  .luxury-footer__subrow {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 24px;
    padding-top: 40px;
  }

  .luxury-footer__social {
    display: flex;
    gap: 10px;
  }

  .luxury-footer__social-link {
    text-decoration: none;
  }

  .luxury-footer__contact {
    text-align: right;
    font-size: 12px;
    line-height: 1.6;
  }

  .luxury-footer__contact p {
    margin: 0;
  }

  @media (max-width: 1100px) {
    .luxury-footer {
      width: calc(100vw - 40px);
      padding: 32px 0;
    }

    .luxury-footer__connect-column {
      padding: 44px 28px;
    }

    .luxury-footer__links {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 18px 28px;
    }
  }

  @media (max-width: 720px) {
    .luxury-footer__connect-column {
      padding-left: 0;
      padding-right: 0;
    }

    .luxury-footer__subrow {
      grid-template-columns: 1fr;
    }

    .luxury-footer__contact {
      text-align: left;
    }
  }
`;

const getSocialIcon = (icon: SocialLink["icon"]): React.ReactNode => {
  switch (icon) {
    case "facebook":
      return <FaFacebookF />;
    case "instagram":
      return <FaInstagram />;
    case "pinterest":
      return <FaPinterestP />;
    case "snapchat":
      return <FaSnapchatGhost />;
    case "tiktok":
      return <FaTiktok />;
    case "x":
      return <FaXTwitter />;
    default:
      return null;
  }
};

const LuxuryRetailFooterSectionComponent: PuckComponent<
  LuxuryRetailFooterSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<StreamDocumentValue>();
  const locale = streamDocument.locale ?? "en";
  const footerContentColor = getReadableTextColor(
    undefined,
    props.section?.backgroundColor,
    streamDocument,
  );
  const footerFontColor =
    getThemeColorCssValue(props.fontColor) ??
    getReadableTextColor(undefined, props.section?.backgroundColor, streamDocument);
  const resolvedAddress = resolveComponentData(props.address, locale, streamDocument);
  const resolvedPhones = (props.phones.items ?? []).reduce<
    Array<{
      label: string;
      formattedNumber: string;
      telDigits: string;
      fieldId: string;
      constantValueEnabled: boolean | undefined;
    }>
  >((items, item) => {
    const resolvedNumber = resolveComponentData(item.number, locale, streamDocument);
    const normalizedNumber =
      typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";

    if (!normalizedNumber) {
      return items;
    }

    const parsed = parsePhoneNumber(normalizedNumber);
    const formattedNumber =
      parsed.valid && parsed.number
        ? props.phones.phoneFormat === "international"
          ? parsed.number.international
          : parsed.number.national
        : normalizedNumber;

    items.push({
      label: item.label.trim(),
      formattedNumber,
      telDigits: normalizedNumber.replace(/\D/g, ""),
      fieldId: item.number.field,
      constantValueEnabled: item.number.constantValueEnabled,
    });

    return items;
  }, []);

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailFooterSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        <style>{footerCss}</style>
        <div
          className="luxury-footer-section"
          style={{
            backgroundColor: getThemeColorCssValue(props.section?.backgroundColor),
          }}
        >
          <footer className="luxury-footer">
            <div
              className="luxury-footer__connect"
              style={{
                borderTopColor: footerContentColor,
                borderBottomColor: footerContentColor,
              }}
            >
              <div className="luxury-footer__connect-column">
                <div
                  className="luxury-footer__links"
                  style={
                    {
                      "--luxury-footer-link-color": footerFontColor,
                    } as React.CSSProperties
                  }
                >
                  {props.footerLinks.map((item, index) => {
                    const linkData = getCtaLinkData(item.cta, locale, streamDocument);

                    return (
                      <EntityField
                        key={`${linkData.label}-${index}`}
                        displayName="Footer Link"
                        fieldId={item.cta.field}
                        constantValueEnabled={item.cta.constantValueEnabled}
                      >
                        <Link
                          cta={{
                            link: linkData.link,
                            linkType: linkData.linkType,
                          }}
                          eventName={`footerLink${index}`}
                          className="luxury-footer__nav-link"
                        >
                          {linkData.label}
                        </Link>
                      </EntityField>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="luxury-footer__subrow">
              <div className="luxury-footer__social">
                {props.socialLinks.map((item, index) => {
                  const linkData = getCtaLinkData(item.cta, locale, streamDocument);

                  return (
                    <EntityField
                      key={`${linkData.label}-${index}`}
                      displayName="Social Link"
                      fieldId={item.cta.field}
                      constantValueEnabled={item.cta.constantValueEnabled}
                    >
                      <Link
                        cta={{
                          link: linkData.link,
                          linkType: linkData.linkType,
                        }}
                        eventName={`socialLink${index}`}
                        className="luxury-footer__social-link"
                        aria-label={linkData.label}
                        style={{ color: footerContentColor }}
                      >
                        {getSocialIcon(item.icon)}
                      </Link>
                    </EntityField>
                  );
                })}
              </div>
              <div
                className="luxury-footer__contact"
                style={{ color: footerFontColor }}
              >
                {resolvedAddress ? (
                  <EntityField
                    displayName="Address"
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
                {resolvedPhones.map((item) => (
                  <EntityField
                    key={`${item.fieldId}-${item.formattedNumber}`}
                    displayName="Phone Number"
                    fieldId={item.fieldId}
                    constantValueEnabled={item.constantValueEnabled}
                  >
                    <p>
                      {props.phones.includeHyperlink ? (
                        <Link
                          cta={{
                            link: item.telDigits,
                            linkType: "PHONE",
                          }}
                          eventName="contactPhone"
                          style={{ color: "inherit" }}
                        >
                          {item.label
                            ? `${item.label} ${item.formattedNumber}`
                            : item.formattedNumber}
                        </Link>
                      ) : (
                        item.formattedNumber
                      )}
                    </p>
                  </EntityField>
                ))}
                {(() => {
                  const linkData = getCtaLinkData(
                    props.websiteCta,
                    locale,
                    streamDocument,
                  );

                  return (
                    <EntityField
                      displayName="Website Link"
                      fieldId={props.websiteCta.field}
                      constantValueEnabled={props.websiteCta.constantValueEnabled}
                    >
                      <p>
                        <Link
                          cta={{
                            link: linkData.link,
                            linkType: linkData.linkType,
                          }}
                          eventName="contactWebsite"
                          style={{ color: "inherit" }}
                        >
                          {linkData.label}
                        </Link>
                      </p>
                    </EntityField>
                  );
                })()}
              </div>
            </div>
          </footer>
        </div>
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailFooterSection: YextComponentConfig<LuxuryRetailFooterSectionProps> =
  {
    label: "Footer Section",
    fields: LuxuryRetailFooterSectionFields,
    defaultProps: {
      footerLinks: [
        {
          cta: getCtaFieldDefault("Departments", "#"),
        },
        {
          cta: getCtaFieldDefault("Shopping Services", "#"),
        },
        {
          cta: getCtaFieldDefault("Locations", "#"),
        },
        {
          cta: getCtaFieldDefault("Returns", "#"),
        },
        {
          cta: getCtaFieldDefault("Contact", "#"),
        },
      ],
      socialLinks: [
        {
          cta: getCtaFieldDefault("Facebook", "#"),
          icon: "facebook",
        },
        {
          cta: getCtaFieldDefault("Instagram", "#"),
          icon: "instagram",
        },
        {
          cta: getCtaFieldDefault("Pinterest", "#"),
          icon: "pinterest",
        },
        {
          cta: getCtaFieldDefault("Snapchat", "#"),
          icon: "snapchat",
        },
        {
          cta: getCtaFieldDefault("TikTok", "#"),
          icon: "tiktok",
        },
        {
          cta: getCtaFieldDefault("X", "#"),
          icon: "x",
        },
      ],
      websiteCta: getCtaFieldDefault(
        "northlineapparel.com/locations/lincoln-park",
        "https://www.northlineapparel.com/locations/lincoln-park",
      ),
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
      fontColor: undefined,
      section: {
        backgroundColor: {
          selectedColor: "white",
          contrastingColor: "palette-quaternary",
        },
        visibleOnLivePage: true,
      },
    },
    render: (props) => <LuxuryRetailFooterSectionComponent {...props} />,
  };

export const config: SectionConfig = {
  id: "LuxuryRetailFooterSection",
  displayName: "Footer Section",
  description: "Footer Section",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
