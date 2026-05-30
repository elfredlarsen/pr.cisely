import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getMyRoleInfo } from "@/lib/auth.functions";

export function useMyRoleInfo(enabled: boolean) {
  const fetcher = useServerFn(getMyRoleInfo);
  return useQuery({
    queryKey: ["my-role-info"],
    queryFn: () => fetcher(),
    enabled,
    staleTime: 60 * 1000,
  });
}
