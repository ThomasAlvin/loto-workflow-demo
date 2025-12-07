import { combineReducers } from "redux";
import adminReducer from "./middleware/adminAuth.jsx";

const rootReducer = combineReducers({
  auth: adminReducer,
});

export default rootReducer;
