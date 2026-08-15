import { useAuth } from "@/context/AuthContext";
import { MOCK_RESOURCES, type Resource } from "@/mocks/resources";
import { can } from "@/utils/permissions";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] =
    useState<readonly Resource[]>(MOCK_RESOURCES);
  const [actionError, setActionError] = useState<string>();

  // state has three statuses and only the signed in one holds a user. This
  // check tells TypeScript which status we have, so state.user works below.
  if (state.status !== "authenticated") {
    return null;
  }

  const user = state.user;
  const canWrite = can(user, "write");
  const canDelete = can(user, "delete");

  // Switches one resource between active and inactive. The buttons use
  // aria-disabled rather than disabled, so they stay reachable by keyboard and
  // the click still arrives here. This check is what actually refuses it.
  function handleToggle(resource: Resource) {
    if (!can(user, "write")) {
      setActionError("Your account cannot make changes.");
      return;
    }

    setResources((current) =>
      current.map((item) =>
        item.id === resource.id
          ? {
              ...item,
              status: item.status === "active" ? "inactive" : "active",
            }
          : item,
      ),
    );
  }

  // Removes one resource from the list, with the same check for the same reason.
  function handleDelete(resource: Resource) {
    if (!can(user, "delete")) {
      setActionError("Your account cannot delete resources.");
      return;
    }

    setResources((current) =>
      current.filter((item) => item.id !== resource.id),
    );
  }

  // Clears the signed in user and sends them back to the login screen.
  function handleSignOut() {
    logout();
    navigate("/login");
  }

  // The screen itself: who is signed in, what their account can do, and a table
  // of resources with an activate/deactivate and a delete button on each row.
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Resources</h1>
            <p className={styles.signedInAs}>
              Signed in as {user.name} ({user.email})
            </p>
          </div>
          <button
            className={styles.signOutButton}
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </header>

        <p className={styles.notice}>
          {canWrite
            ? "Your account can edit and delete resources."
            : "Your account is read-only."}
        </p>

        {actionError && (
          <p className={styles.error} role="alert">
            {actionError}
          </p>
        )}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Region</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.name}</td>
                <td>{resource.region}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      resource.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {resource.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionButton}
                      type="button"
                      onClick={() => handleToggle(resource)}
                      aria-disabled={!canWrite}
                    >
                      {resource.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.dangerButton}`}
                      type="button"
                      onClick={() => handleDelete(resource)}
                      aria-disabled={!canDelete}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
