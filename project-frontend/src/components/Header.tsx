import React from "react";
import { Link } from "react-router";

function Header() {
  return (
    <header className="bg-primary w-full h-16 justify-center flex">
      <div className="relative flex grow justify-end  max-w-8/10">
        <Link
          to="/auth"
          className="text-white flex flex-col justify-center items-center h-full w-16"
        >
          <svg
            viewBox="0 0 32 32"
            enable-background="new 0 0 32 32"
            fill="currentColor"
            width="24px"
            height="24px"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <circle
                  cx="16"
                  cy="16"
                  fill="none"
                  r="15"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  stroke-width="2"
                ></circle>
                <path
                  d="M26,27L26,27 c0-5.523-4.477-10-10-10h0c-5.523,0-10,4.477-10,10v0"
                  fill="none"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  stroke-width="2"
                ></path>
                <circle
                  cx="16"
                  cy="11"
                  fill="none"
                  r="6"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  stroke-width="2"
                ></circle>
              </g>
            </g>
          </svg>
          login
        </Link>
      </div>
    </header>
  );
}

export default Header;
