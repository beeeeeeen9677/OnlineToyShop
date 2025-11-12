import { Activity } from "react";
import { Link } from "react-router";
import { useLoginContext, useUserContext } from "../context/app";

function Header() {
  const isLoggedIn = useLoginContext();
  const user = useUserContext();
  const isAdmin = isLoggedIn && user?.role === "admin";
  const duration = "200";
  return (
    <header className="bg-primary w-full h-16 justify-center flex">
      <div className="relative flex grow justify-between  max-w-8/10">
        <Link to="/">
          <img src={"/logo.png"} alt="Logo" className="h-full py-0.5 my-auto" />
        </Link>
        <div className="flex items-center gap-10">
          <Activity mode={isAdmin ? "visible" : "hidden"}>
            <Link to="/admin">
              <p className="hover:scale-125 transition duration-150">Admin</p>
            </Link>
          </Activity>
          <Link
            to="/auth"
            className="group text-white flex flex-col justify-center items-center h-full w-16 transition duration-1000"
          >
            <svg
              className={`group-hover:scale-150 group-hover:translate-y-3 transition duration-${duration}`}
              viewBox="0 0 32 32"
              enableBackground="new 0 0 32 32"
              fill="currentColor"
              width="24px"
              height="24px"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <circle
                    cx="16"
                    cy="16"
                    fill="none"
                    r="15"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></circle>
                  <path
                    d="M26,27L26,27 c0-5.523-4.477-10-10-10h0c-5.523,0-10,4.477-10,10v0"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></path>
                  <circle
                    cx="16"
                    cy="11"
                    fill="none"
                    r="6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                    strokeWidth="2"
                  ></circle>
                </g>
              </g>
            </svg>
            <p
              className={`group-hover:text-primary  transition duration-${duration}`}
            >
              {!isLoggedIn ? "Log in" : "Log out"}
            </p>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
