import Header from "../../components/Header";
import { useTranslation } from "../../i18n/hooks";
import { useEffect } from "react";
import { useUserContext } from "../../context/app";

function Profile() {
  const { t } = useTranslation("common");
  const user = useUserContext();

  useEffect(() => {}, []);

  if (user === undefined) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-100">
          <div className="text-5xl text">Invalid User</div>
        </div>
      </>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Profile</title>
      <Header />
    </div>
  );
}

export default Profile;
