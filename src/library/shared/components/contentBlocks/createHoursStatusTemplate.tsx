import type { StatusParams } from "@yext/pages-components";
import type { TFunction } from "i18next";

type TranslatedHoursStatusTemplateOptions = {
  t: TFunction;
  locale: string;
  showCurrentStatus?: boolean;
  showDayNames?: boolean;
  boldCurrentStatus?: boolean;
  className?: string;
};

export const createHoursStatusTemplate = ({
  t,
  locale,
  showCurrentStatus = true,
  showDayNames = true,
  boldCurrentStatus = true,
  className,
}: TranslatedHoursStatusTemplateOptions) => {
  return (params: StatusParams) => {
    const isComingSoon = Boolean(params.comingSoon);
    const open24Hours = isOpen24Hours(params);
    const indefinitelyClosed = !params.futureInterval;
    const hasFutureStatus = !open24Hours && !indefinitelyClosed;
    const interval = params.isOpen
      ? params.currentInterval
      : params.futureInterval;
    const time = params.isOpen
      ? interval?.getEndTime(locale, params.timeOptions) ?? ""
      : interval?.getStartTime(locale, params.timeOptions) ?? "";
    const dayOfWeek = params.isOpen
      ? interval?.end?.setLocale(locale).toLocaleString(params.dayOptions) ?? ""
      : interval?.start?.setLocale(locale).toLocaleString(params.dayOptions) ?? "";
    const showDayOfWeek = showDayNames && hasFutureStatus;

    let futureStatus = "";
    if (hasFutureStatus && params.isOpen) {
      futureStatus = showDayOfWeek
        ? t("closesAtTimeWeek", "Closes at {{time}} {{dayOfWeek}}", {
            time,
            dayOfWeek,
          })
        : t("closesAtTime", "Closes at {{time}}", { time });
    } else if (hasFutureStatus) {
      futureStatus = showDayOfWeek
        ? t("opensAtTimeWeek", "Opens at {{time}} {{dayOfWeek}}", {
            time,
            dayOfWeek,
          })
        : t("opensAtTime", "Opens at {{time}}", { time });
    }

    const currentStatus = isComingSoon
      ? t("comingSoon", "Coming Soon")
      : open24Hours
        ? t("open24Hours", "Open 24 Hours")
        : indefinitelyClosed
          ? t("temporarilyClosed", "Temporarily Closed")
          : params.isOpen
            ? t("openNow", "Open Now")
            : t("closed", "Closed");

    return (
      <div className={["HoursStatus", className].filter(Boolean).join(" ")}>
        {(showCurrentStatus || isComingSoon) && (
          <span
            className="HoursStatus-current"
            style={boldCurrentStatus ? { fontWeight: "bolder" } : undefined}
          >
            {currentStatus}
          </span>
        )}
        {!isComingSoon && showCurrentStatus && hasFutureStatus ? (
          <span className="HoursStatus-separator"> • </span>
        ) : null}
        {!isComingSoon && futureStatus ? (
          <span className="HoursStatus-future">{futureStatus}</span>
        ) : null}
      </div>
    );
  };
};

const isOpen24Hours = (params: StatusParams) =>
  params.currentInterval?.is24h?.() ?? false;
