import Header from "../../components/Header";
import { useUserContext } from "../../context/app";
import { auth } from "../../firebase/firebase";
import UserForm from "./UserForm";

function Profile() {
  const userContext = useUserContext();

  if (!userContext) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-100">
          <div className="text-5xl text">-</div>
        </div>
      </>
    );
  }

  const emailVerified = auth.currentUser?.emailVerified;
  const isPasswordProvider = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === "password"
  );
  const user = {
    ...userContext,
    emailVerified: emailVerified,
    isPasswordProvider,
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <title>PROFILE | PREMIUM BEN TOYS</title>
      <Header />
      <UserForm user={user} />
    </div>
  );
}

export default Profile;
