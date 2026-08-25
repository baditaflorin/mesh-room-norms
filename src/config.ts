import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-room-norms",
  displayName: "Room Norms",
  visualProfile: "gather",
  shellLayout: "inset",
  description: "A browser-local shared agreement board for group room norms.",
  accentHex: "#8fe4d6",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});
