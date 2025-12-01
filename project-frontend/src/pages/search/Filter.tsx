import { useTranslation } from "../../i18n/hooks";

function Filter() {
  const { t } = useTranslation("search");
  return (
    <div className="hidden md:block bg-orange-100 dark:bg-gray-500 w-300 h-fit px-4 py-6 space-y-4 sticky top-20 self-start">
      <div className="font-oswald font-bold text-2xl">{t("filter")}</div>
      <div className="font-oswald  text-md">{t("selectedFilters")}</div>
      {/* selected filters */}
      <div></div>
      {/* filter options */}
      <div></div>
    </div>
  );
}

export default Filter;
