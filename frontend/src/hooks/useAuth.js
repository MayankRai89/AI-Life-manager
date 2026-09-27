import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  registerUser,
  logout,
  fetchCurrentUser,
} from "../redux/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  return {
    ...authState,
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    logout: () => dispatch(logout()),
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
  };
}

export default useAuth;
