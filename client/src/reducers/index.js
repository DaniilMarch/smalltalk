import { combineReducers } from "redux";
import { reducer } from "redux-form";

import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import messagesReducer from "./messagesReducer";
import typingReducer from "./typingReducer";
import usersReducer from "./usersReducer";

export default combineReducers({
  test: () => 5,
  form: reducer,
  auth: authReducer,
  error: errorReducer,
  messages: messagesReducer,
  typing: typingReducer,
  users: usersReducer
});
