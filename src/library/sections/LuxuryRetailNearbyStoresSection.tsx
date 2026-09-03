import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import { PuckComponent } from "@puckeditor/core";
import { parsePhoneNumber } from "awesome-phonenumber";
import {
  EntityField,
  MapboxStaticMapComponent,
  getAnalyticsScopeHash,
  isDarkColor,
  mapboxStaticMapStyleOptions,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
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
  Link,
  type AddressType,
  type Coordinate,
} from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type NearbyPhoneFieldProps = {
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type NearbyAddressFieldProps = {
  showRegion: boolean;
  showCountry: boolean;
};

type NearbyStreamDocument = Record<string, unknown> & {
  _env?: {
    YEXT_MAPBOX_API_KEY?: string;
    YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY?: string;
  };
  locale?: string;
  yextDisplayCoordinate?: Coordinate;
  geomodifier?: string;
};

type LuxuryRetailNearbyStoresSectionProps = {
  title: StyledTextProps;
  map: {
    coordinate: YextEntityField<Coordinate>;
    mapStyle: string;
    zoom: number;
    height?: string;
  };
  radius: number;
  limit: number;
  cardBackgroundColor: ThemeColor;
  cardTextColor?: ThemeColor;
  showPhone: boolean;
  showAddress: boolean;
  phone: NearbyPhoneFieldProps;
  address: NearbyAddressFieldProps;
  section: {
    backgroundColor: ThemeColor;
    visibleOnLivePage: boolean;
  };
};

const MapboxStaticMapRuntime =
  MapboxStaticMapComponent as React.ComponentType<{
    apiKey: string;
    coordinate: YextEntityField<Coordinate>;
    mapStyle: string;
    zoom?: number;
    height?: string;
    editMode?: boolean;
  }>;

const LuxuryRetailNearbyStoresSectionFields: YextFields<
  LuxuryRetailNearbyStoresSectionProps
> = {
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
  map: {
    label: "Map",
    type: "object",
    objectFields: {
      coordinate: {
        type: "entityField",
        label: "Coordinates",
        filter: { types: ["type.coordinate"] },
      },
      mapStyle: {
        label: "Mapbox Map Style",
        type: "select",
        options: mapboxStaticMapStyleOptions,
      },
      zoom: {
        label: "Zoom",
        type: "number",
        min: 0,
        max: 22,
      },
    },
  },
  radius: {
    label: "Radius",
    type: "number",
  },
  limit: {
    label: "Limit",
    type: "number",
  },
  cardBackgroundColor: {
    label: "Card Background Color",
    type: "basicSelector",
    options: "BACKGROUND_COLOR",
  },
  cardTextColor: {
    label: "Text Color",
    type: "basicSelector",
    options: "SITE_COLOR",
  },
  showPhone: {
    label: "Show Phone",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  showAddress: {
    label: "Show Address",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  phone: {
    label: "Phone",
    type: "object",
    objectFields: {
      phoneFormat: {
        label: "Phone Number Format",
        type: "radio",
        options: [
          { label: "Domestic", value: "domestic" },
          { label: "International", value: "international" },
        ],
      },
      includeHyperlink: {
        label: "Include Phone Hyperlink",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  address: {
    label: "Address",
    type: "object",
    objectFields: {
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
    },
  },
};

const nearbyCss = `
  .luxury-nearby :where(p) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-nearby :where(li) {
    font-family: var(--fontFamily-body-fontFamily);
    font-size: var(--fontSize-body-fontSize);
    line-height: 1.5;
    font-weight: var(--fontWeight-body-fontWeight);
    font-style: var(--fontStyle-body-fontStyle);
    text-transform: var(--textTransform-body-textTransform);
  }

  .luxury-nearby :where(h1) {
    font-family: var(--fontFamily-h1-fontFamily);
    font-size: var(--fontSize-h1-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h1-fontWeight);
    font-style: var(--fontStyle-h1-fontStyle);
    text-transform: var(--textTransform-h1-textTransform);
  }

  .luxury-nearby :where(h2) {
    font-family: var(--fontFamily-h2-fontFamily);
    font-size: var(--fontSize-h2-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h2-fontWeight);
    font-style: var(--fontStyle-h2-fontStyle);
    text-transform: var(--textTransform-h2-textTransform);
  }

  .luxury-nearby :where(h3) {
    font-family: var(--fontFamily-h3-fontFamily);
    font-size: var(--fontSize-h3-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h3-fontWeight);
    font-style: var(--fontStyle-h3-fontStyle);
    text-transform: var(--textTransform-h3-textTransform);
  }

  .luxury-nearby :where(h4) {
    font-family: var(--fontFamily-h4-fontFamily);
    font-size: var(--fontSize-h4-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h4-fontWeight);
    font-style: var(--fontStyle-h4-fontStyle);
    text-transform: var(--textTransform-h4-textTransform);
  }

  .luxury-nearby :where(h5) {
    font-family: var(--fontFamily-h5-fontFamily);
    font-size: var(--fontSize-h5-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h5-fontWeight);
    font-style: var(--fontStyle-h5-fontStyle);
    text-transform: var(--textTransform-h5-textTransform);
  }

  .luxury-nearby :where(h6) {
    font-family: var(--fontFamily-h6-fontFamily);
    font-size: var(--fontSize-h6-fontSize);
    line-height: 1.2;
    font-weight: var(--fontWeight-h6-fontWeight);
    font-style: var(--fontStyle-h6-fontStyle);
    text-transform: var(--textTransform-h6-textTransform);
  }

  .luxury-nearby :where(a) {
    font-family: var(--fontFamily-link-fontFamily);
    font-size: var(--fontSize-link-fontSize);
    font-weight: var(--fontWeight-link-fontWeight);
    font-style: var(--fontStyle-link-fontStyle);
    line-height: 1.5;
    text-decoration: underline;
    text-transform: var(--textTransform-link-textTransform);
    letter-spacing: var(--letterSpacing-link-letterSpacing);
  }

  .luxury-nearby {
    width: 100%;
    margin: 0;
    padding: 96px 0 48px;
  }

  .luxury-nearby__inner {
    width: min(1220px, calc(100vw - 64px));
    margin: 0 auto;
  }

  .luxury-nearby__title {
    margin: 0 0 48px;
    font-family: var(--fontFamily-h3-fontFamily, Georgia, serif);
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;
  }

  .luxury-nearby__map {
    margin-bottom: 26px;
    overflow: hidden;
  }

  .luxury-nearby__map-shell,
  .luxury-nearby__map-shell .mapbox-static-map-shell,
  .luxury-nearby__map-shell .mapbox-static-map-picture,
  .luxury-nearby__map-shell .mapbox-static-map-image {
    width: 100%;
    height: 100%;
  }

  .luxury-nearby__map-shell .mapbox-static-map-image {
    object-fit: cover;
    object-position: center;
  }

  .luxury-nearby__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: stretch;
    gap: 48px;
  }

  .luxury-nearby__card {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    gap: 0;
  }

  .luxury-nearby__card--with-background {
    padding: 28px;
  }

  .luxury-nearby__card-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .luxury-nearby__card-title {
    margin: 0 0 20px;
    font-family: var(--fontFamily-h4-fontFamily, Georgia, serif);
    font-size: clamp(18px, 1.5vw, 22px);
    font-weight: 400;
    line-height: 1.35;
  }

  .luxury-nearby__details {
    display: grid;
    gap: 0;
  }

  .luxury-nearby__line,
  .luxury-nearby__distance {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
  }

  .luxury-nearby__link {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 8px;
    position: relative;
    margin-top: 18px;
    padding: 8px 12px 8px 0;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-decoration: none;
    text-transform: uppercase;
    transition: transform 0.18s ease;
  }

  .luxury-nearby__link::after {
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

  .luxury-nearby__link:hover,
  .luxury-nearby__link:focus-visible {
    transform: translateX(4px);
  }

  .luxury-nearby__link:hover::after,
  .luxury-nearby__link:focus-visible::after {
    transform: scaleX(1);
    opacity: 1;
  }

  @media (max-width: 1100px) {
    .luxury-nearby {
      padding: 64px 0 32px;
    }

    .luxury-nearby__inner {
      width: calc(100vw - 40px);
    }

    .luxury-nearby__grid {
      grid-template-columns: 1fr;
      row-gap: 32px;
    }
  }

  @media (max-width: 720px) {
    .luxury-nearby__title {
      margin-bottom: 32px;
    }

    .luxury-nearby__map-shell {
      height: 280px !important;
    }

    .luxury-nearby__map {
      margin-bottom: 0;
    }

    .luxury-nearby__grid {
      margin-top: 32px;
    }
  }
`;

function resolveThemeColorCssValue(color?: ThemeColor): string | undefined {
  if (!color?.selectedColor || color.selectedColor === "default") {
    return undefined;
  }

  switch (color?.selectedColor) {
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
      return color?.selectedColor;
  }
}

function resolveReadableTextColor(
  fontColor: ThemeColor | undefined,
  backgroundColor: ThemeColor | undefined,
  streamDocument: Record<string, unknown>,
): string | undefined {
  return (
    resolveThemeColorCssValue(fontColor) ??
    (isDarkColor(
      backgroundColor ?? {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
      streamDocument,
    )
      ? resolveThemeColorCssValue({
          selectedColor: "white",
          contrastingColor: "black",
        })
      : resolveThemeColorCssValue({
          selectedColor: "black",
          contrastingColor: "white",
        }))
  );
}

function formatNearbyPhoneNumber(
  phoneNumberString: string,
  format: "international" | "domestic",
): string {
  const cleanedPhoneNumberString = phoneNumberString.replace(
    /(?!^\+)\+|[^\d+]/g,
    "",
  );
  const parsedPhoneNumber = parsePhoneNumber(cleanedPhoneNumberString);

  if (!parsedPhoneNumber.valid || parsedPhoneNumber.number === undefined) {
    return phoneNumberString;
  }

  return format === "international"
    ? parsedPhoneNumber.number.international
    : parsedPhoneNumber.number.national;
}

const LuxuryRetailNearbyStoresSectionComponent: PuckComponent<
  LuxuryRetailNearbyStoresSectionProps
> = ({ id, ...props }) => {
  const streamDocument = useDocument<NearbyStreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{ relativePrefixToRoot?: string }>();
  const coordinate = streamDocument?.yextDisplayCoordinate;
  const enableNearbyLocations =
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    !!props.radius &&
    !!props.limit;
  const { data, status } = useNearbyLocations({
    streamDocument,
    latitude: coordinate?.latitude,
    longitude: coordinate?.longitude,
    radiusMi: props.radius,
    limit: props.limit,
    enabled: enableNearbyLocations,
  });
  const docs = data?.response?.docs ?? [];
  const title = resolveComponentData(props.title.text, locale, streamDocument) || "";
  const sectionTitleColor = resolveReadableTextColor(
    props.title.fontColor,
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
    color: sectionTitleColor,
  };
  const sectionBackgroundColor = resolveThemeColorCssValue(
    props.section?.backgroundColor,
  );
  const cardBackgroundColor = resolveThemeColorCssValue(
    props.cardBackgroundColor,
  );
  const cardTextColor = resolveReadableTextColor(
    props.cardTextColor,
    props.cardBackgroundColor,
    streamDocument,
  );
  const shouldShowContent =
    enableNearbyLocations && status === "success" && docs.length > 0;
  const shouldShowLoading = enableNearbyLocations && status === "pending";
  const shouldShowEmptyState =
    enableNearbyLocations &&
    status !== "pending" &&
    (!docs.length || status !== "success");
  let mapboxApiKey = streamDocument._env?.YEXT_MAPBOX_API_KEY;
  if (typeof window !== "undefined") {
    const iframe = window.frameElement;
    if (
      iframe instanceof HTMLIFrameElement &&
      iframe.contentDocument &&
      streamDocument._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY
    ) {
      mapboxApiKey = streamDocument._env.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
    }
  }

  return (
    <AnalyticsScopeProvider
      name={`LuxuryRetailNearbyStoresSection${getAnalyticsScopeHash(id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.section.visibleOnLivePage}
        isEditing={props.puck.isEditing}
      >
        {!enableNearbyLocations ? (
          <></>
        ) : shouldShowEmptyState && !props.puck.isEditing ? (
          <></>
        ) : (
          <>
        <style>{nearbyCss}</style>
        <section
          className="luxury-nearby"
          style={{
            backgroundColor: sectionBackgroundColor,
          }}
        >
          <div className="luxury-nearby__inner">
          <EntityField
            displayName="Title"
            fieldId={props.title.text.field}
            constantValueEnabled={props.title.text.constantValueEnabled}
          >
            <h2 className="luxury-nearby__title" style={titleStyle}>
              {title}
            </h2>
          </EntityField>

          <div className="luxury-nearby__map">
            <div className="luxury-nearby__map-shell" style={{ height: "500px" }}>
              <EntityField
                displayName="Map Coordinates"
                fieldId={props.map.coordinate.field}
                constantValueEnabled={props.map.coordinate.constantValueEnabled}
              >
                <MapboxStaticMapRuntime
                  apiKey={mapboxApiKey ?? ""}
                  coordinate={props.map.coordinate}
                  mapStyle={props.map.mapStyle}
                  zoom={props.map.zoom}
                  height={props.map.height}
                  editMode={props.editMode}
                />
              </EntityField>
            </div>
          </div>

          {shouldShowLoading ? (
            <p>Loading nearby locations</p>
          ) : null}

          {shouldShowEmptyState && props.puck.isEditing ? (
            <p>No nearby locations found for this location</p>
          ) : null}

          {shouldShowContent ? (
            <div className="luxury-nearby__grid">
            {docs.map((locationData, index) => {
              const resolvedUrl = resolveUrlTemplate(
                mergeMeta(locationData, streamDocument),
                relativePrefixToRoot ?? "",
              );
              const locationCoordinate = locationData.yextDisplayCoordinate;
              const typedLocationData = locationData as Record<string, unknown>;
              const distanceValue =
                typeof typedLocationData.distance === "number"
                  ? typedLocationData.distance
                  : undefined;
              const directionsUrl =
                locationCoordinate?.latitude !== undefined &&
                locationCoordinate?.longitude !== undefined
                  ? `https://maps.google.com/maps/search/?api=1&query=${locationCoordinate.latitude},${locationCoordinate.longitude}`
                  : undefined;
              const resolvedMainPhone =
                typeof locationData.mainPhone === "string"
                  ? locationData.mainPhone.trim()
                  : "";
              const telDigits = resolvedMainPhone.replace(/\D/g, "");
              const formattedPhoneNumber = resolvedMainPhone
                ? formatNearbyPhoneNumber(
                    resolvedMainPhone,
                    props.phone.phoneFormat,
                  )
                : "";
              const resolvedAddress = locationData.address as
                | AddressType
                | undefined;

              return (
                <article
                  className={`luxury-nearby__card luxury-nearby__card--with-background"`}
                  key={locationData.id ?? locationData.name ?? index}
                  style={{
                    backgroundColor: cardBackgroundColor,
                    color: cardTextColor,
                  }}
                >
                  <Link
                    cta={{
                      link: resolvedUrl,
                      linkType: "URL",
                    }}
                    eventName={`nearbyStore${index}`}
                    className="luxury-nearby__card-link"
                  >
                    <h3
                      className="luxury-nearby__card-title"
                      style={{ color: cardTextColor }}
                    >
                      {locationData.name}
                    </h3>
                  </Link>
                  <div className="luxury-nearby__details">
                    {props.showAddress && resolvedAddress ? (
                      <div
                        className="luxury-nearby__line"
                        style={{ color: cardTextColor }}
                      >
                        <Address
                          address={resolvedAddress}
                          showRegion={props.address.showRegion}
                          showCountry={props.address.showCountry}
                        />
                      </div>
                    ) : null}
                    {props.showPhone && formattedPhoneNumber ? (
                      !props.phone.includeHyperlink || !telDigits ? (
                        <p
                          className="luxury-nearby__line"
                          style={{ color: cardTextColor }}
                        >
                          {formattedPhoneNumber}
                        </p>
                      ) : (
                        <Link
                          cta={{
                            link: telDigits,
                            linkType: "PHONE",
                          }}
                          eventName={`nearbyPhone${index}`}
                          className="luxury-nearby__line"
                          style={{ color: cardTextColor }}
                        >
                          {formattedPhoneNumber}
                        </Link>
                      )
                    ) : null}
                    {distanceValue ? (
                      <p
                        className="luxury-nearby__distance"
                        style={{ color: cardTextColor }}
                      >
                        {`Located ${distanceValue.toFixed(1)} miles from ${
                          streamDocument.geomodifier ?? "this location"
                        }`}
                      </p>
                    ) : null}
                  </div>
                  {directionsUrl ? (
                    <Link
                      cta={{
                        link: directionsUrl,
                        linkType: "URL",
                      }}
                      eventName={`nearbyDirections${index}`}
                      className="luxury-nearby__link"
                      style={{ color: cardTextColor }}
                    >
                      Get Directions <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                </article>
              );
            })}
            </div>
          ) : null}
          </div>
        </section>
          </>
        )}
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  );
};

export const LuxuryRetailNearbyStoresSection: YextComponentConfig<
  LuxuryRetailNearbyStoresSectionProps
> = {
  label: "Nearby Stores Section",
  fields: LuxuryRetailNearbyStoresSectionFields,
  defaultProps: {
    title: {
      text: {
        field: "",
        constantValue: {
          defaultValue: "Nearby Northline Apparel Stores",
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
    map: {
      coordinate: {
        field: "yextDisplayCoordinate",
        constantValue: {
          latitude: 0,
          longitude: 0,
        },
        constantValueEnabled: false,
      },
      mapStyle: "streets-v12",
      zoom: 10,
      height: "100%",
    },
    radius: 10,
    limit: 3,
    cardBackgroundColor: {
      selectedColor: "white",
      contrastingColor: "palette-quaternary",
    },
    cardTextColor: undefined,
    showPhone: true,
    showAddress: true,
    phone: {
      phoneFormat: "domestic",
      includeHyperlink: true,
    },
    address: {
      showRegion: true,
      showCountry: false,
    },
    section: {
      backgroundColor: {
        selectedColor: "white",
        contrastingColor: "palette-quaternary",
      },
      visibleOnLivePage: true,
    },
  },
  render: (props) => <LuxuryRetailNearbyStoresSectionComponent {...props} />,
};

export const config: SectionConfig = {
  id: "LuxuryRetailNearbyStoresSection",
  displayName: "Nearby Stores Section",
  description: "Nearby Stores Section",
  pageSetTypes: ["ENTITY"],
};
