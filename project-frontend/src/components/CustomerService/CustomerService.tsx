import { Activity, useState } from "react";
import { RiCustomerService2Fill } from "react-icons/ri";
import { auth } from "../../firebase/firebase";
import CsPanel from "./CsPanel";

function CustomerService() {
  const [showWindow, setShowWindow] = useState(false);

  if (!auth.currentUser)
    // not logged in
    return null;

  return (
    <>
      <button
        onClick={() => setShowWindow((prev) => !prev)}
        className={`bg-primary text-white hover:bg-primary-hover hover:text-purple-50 dark:bg-white dark:text-primary dark:hover:bg-purple-50 dark:hover:text-primary-hover border-2 border-primary rounded-full flex items-center justify-center font-extrabold text-3xl size-12 fixed bottom-10 right-10 lg:right-30 cursor-pointer transition-transform duration-300 z-20`}
      >
        <RiCustomerService2Fill />
      </button>
      <Activity mode={showWindow ? "visible" : "hidden"}>
        <CsPanel />
      </Activity>
    </>
  );
}

export default CustomerService;
