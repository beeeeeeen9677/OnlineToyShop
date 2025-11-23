import Header from "../../components/Header";
import { useUserContext } from "../../context/app";
import UserForm from "./UserForm";

function Profile() {
  const user = useUserContext();

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
      <UserForm user={user} />
    </div>
  );
}

export default Profile;
