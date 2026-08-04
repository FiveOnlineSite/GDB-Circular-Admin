import api from "../lib/utils/apiConfig";

export const reorderSequence = (scope, items) =>
  api
    .post(
      "/reorder/sequence",
      { scope, items },
      { showGlobalLoader: false },
    )
    .then((r) => r.data);
