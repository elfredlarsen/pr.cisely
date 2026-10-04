import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/arkiv")({
  beforeLoad: () => {
    throw redirect({ to: "/oversigt", replace: true });
  },
});
