import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useTransition } from "react";
import type { User } from "../../../interface/user";
import { Link } from "react-router";

function ViewUser() {
  const { t } = useTranslation("admin");
  const [isPending, startTransition] = useTransition();

  // Filter states
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(true);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const res = await api.get("/admin/user");
      return res.data;
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      // ID or Name filter (searches both ID, firstName, and lastName)
      if (searchFilter) {
        const search = searchFilter.toLowerCase();
        const matchesId = user._id.toLowerCase().includes(search);
        const matchesFirstName = user.firstName?.toLowerCase().includes(search);
        const matchesLastName = user.lastName?.toLowerCase().includes(search);
        const matchesFullName = `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(search);

        if (
          !matchesId &&
          !matchesFirstName &&
          !matchesLastName &&
          !matchesFullName
        ) {
          return false;
        }
      }

      // Gender filter (multi-select)
      if (
        selectedGenders.length > 0 &&
        !selectedGenders.includes(user.gender)
      ) {
        return false;
      }

      return true;
    });
  }, [users, searchFilter, selectedGenders]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchFilter(value);
    });
  };

  const handleGenderToggle = (gender: string) => {
    startTransition(() => {
      setSelectedGenders((prev) =>
        prev.includes(gender)
          ? prev.filter((g) => g !== gender)
          : [...prev, gender]
      );
    });
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading users...</div>
      ) : isError ? (
        <div>
          Error loading users:{" "}
          {(error as AxiosError<{ error: string }>).response?.data?.error}
        </div>
      ) : (
        <>
          {/* Filters Section */}
          {users && (
            <div
              className={`mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4 overflow-hidden ${
                showFilter ? "h-fit" : "h-16"
              }`}
            >
              <h2
                className="font-oswald font-bold text-2xl mb-4 cursor-pointer select-none flex justify-between items-center "
                onClick={() => setShowFilter((prev) => !prev)}
              >
                <p>{t("labels.filters")}</p>
                <p>{showFilter ? " ▲" : " ▼"}</p>
              </h2>

              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("labels.searchUserIdOrName")}
                </label>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={handleSearchChange}
                  placeholder={t("placeholders.searchUserIdOrName")}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Gender Filter (Multi-select checkboxes) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("labels.gender")}
                </label>
                <div className="flex flex-wrap gap-4">
                  {(["male", "female", "not answered"] as const).map(
                    (gender) => (
                      <div key={gender} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`gender-${gender}`}
                          checked={selectedGenders.includes(gender)}
                          onChange={() => handleGenderToggle(gender)}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor={`gender-${gender}`} className="text-sm">
                          {t(`genderOptions.${gender}`, { ns: "admin" })}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isPending ? (
                  <span>{t("labels.filtering")}...</span>
                ) : (
                  <span>
                    {t("labels.showing")} {filteredUsers.length}{" "}
                    {t("labels.of")} {users.length} {t("labels.users")}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="overflow-auto max-h-170">
            {users && users.length > 0 ? (
              <>
                {/* Users List */}
                <div
                  className={isPending ? "opacity-50 transition-opacity" : ""}
                >
                  {filteredUsers.length > 0 ? (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <Link
                          key={user._id}
                          to={`/admin/view-user/${user._id}`}
                          className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 transition-colors"
                        >
                          <div className="font-oswald space-y-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium">
                                {t("labels.userID")}:
                              </span>{" "}
                              {user._id}
                            </div>
                            <div className="text-xl font-bold">
                              {user.firstName} {user.lastName}{" "}
                              {user.role === "admin" && "[ADMIN]"}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {t("labels.gender")}:
                              </span>{" "}
                              {t(`gender.${user.gender}`, { ns: "common" })}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {t("labels.email")}:
                              </span>{" "}
                              {user.email}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <h1 className="font-oswald text-3xl mt-20 mb-20 text-center">
                      {t("messages.noMatchingUsers")}
                    </h1>
                  )}
                </div>
              </>
            ) : (
              <h1 className="font-oswald text-5xl mt-60 mb-20 text-center">
                {t("messages.noUsersFound")}
              </h1>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ViewUser;
