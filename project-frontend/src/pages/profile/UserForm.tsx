import { auth } from "../../firebase/firebase";
import type { User } from "../../interface/user";
import { useTranslation } from "../../i18n/hooks";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
type UserFormProps = {
  user: User;
};

function UserForm({ user }: UserFormProps) {
  const { t } = useTranslation("common");

  return (
    <div className="w-full md:max-w-4/5 lg:max-w-3/5 mx-auto">
      <div className="tw-user-form-field">
        {t("user.userId")}: {user._id}
      </div>

      <div className="tw-user-form-field ">
        {t("user.name")}: {user.firstName} - {user.lastName}
      </div>

      <div className="tw-user-form-field">
        <div>
          {t("user.email")}: {user.email}
          {"  "}
          {auth.currentUser?.emailVerified ? (
            <span className="text-green-600 ">
              <AiOutlineCheckCircle className="inline" /> {t("status.verified")}
            </span>
          ) : (
            <span className="text-red-600 ">
              <AiOutlineCloseCircle className="inline" />
              {t("status.unverified")}
            </span>
          )}
        </div>
      </div>
      <div className="tw-user-form-field">
        {t("user.gender")}: {t(`user.${user.gender}`)}
      </div>
      <div className="tw-user-form-field">
        {t("user.dateOfBirth")}: {user.dateOfBirth.toString().split("T")[0]}
      </div>
    </div>
  );
}

export default UserForm;
