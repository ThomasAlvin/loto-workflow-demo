import userAuth from "../data/userAuth.json";
import notifications from "../data/notifications.json";
import workSites from "../data/workSites.json";
import dashboard from "../data/dashboard.json";

async function delay(ms = 2000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
function errorMessage(message) {
  return {
    response: {
      data: { message },
    },
  };
}
export const mockApi = {
  login: async (loginInput = { email: "", password: "" }) => {
    await delay();
    if (
      loginInput.email === "test@gmail.com" &&
      loginInput.password === "Test@123"
    ) {
      return {
        data: {
          user: userAuth,
        },
      };
    } else {
      throw errorMessage("Invalid email or password");
    }
  },
  logout: async () => {
    await delay();
    return;
  },
  testSubmit: async (successMessage) => {
    await delay();
    return { data: { message: successMessage } };
  },
  getAuth: async () => {
    await delay();
    return {
      data: {
        user: userAuth,
      },
    };
  },
  getNotifications: async () => {
    await delay();
    return notifications;
  },
  getDashboard: async () => {
    await delay();
    return {
      data: {
        ...dashboard,
      },
    };
  },
  getWorkSites: async () => {
    await delay();
    return {
      data: {
        ...workSites,
      },
    };
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
