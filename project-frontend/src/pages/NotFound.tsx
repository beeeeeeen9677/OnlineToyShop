import { Link } from "react-router";
import Header from "./../components/Header";
import { useTranslation } from "../i18n/hooks";

function NotFound() {
  const { t } = useTranslation("common");

  return (
    <div className="animate-fade-in min-h-screen flex flex-col items-center">
      <title>NOT FOUND | PREMIUM BEN TOYS</title>
      <Header />
      <div className="flex flex-col justify-center items-center h-full flex-1 gap-6">
        <div className="text-5xl text font-oswald">404 Not Found</div>
        <Link className="tw-round-primary-btn" to="/">
          {t("buttons.home")}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
