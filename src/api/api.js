async function delay(responseData, ms = 2000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return responseData;
}
function delay(ms) {}
export const mockApi = {
  login: async () => {
    return delay({
      token: "demo-token-123",
      user: {
        id: 1,
        name: "Demo User",
      },
    });
  },

  getWorkOrders: async () => {
    return delay([
      { id: 1, title: "Replace Valve A", status: "open" },
      { id: 2, title: "Check Machine B", status: "in_progress" },
    ]);
  },

  getWorkOrderById: async (id) => {
    return delay({
      id,
      title: "Replace Valve A",
      steps: [
        { id: "s1", name: "Shutdown power" },
        { id: "s2", name: "Apply locks" },
      ],
    });
  },
};

export const api = mockApi;
