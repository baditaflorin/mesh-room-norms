import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-room-norms",
  description: "A browser-local shared agreement board for group room norms.",
  accentHex: "#2563eb",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
