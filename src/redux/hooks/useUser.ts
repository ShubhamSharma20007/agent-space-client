import type { UserState } from "@/interfaces/user.interface";
import { useAppDispatch, useAppSelector } from "../hook";
import { setUser, clearUser } from "../features/userSlice";

export function useUser() {
    const dispatch = useAppDispatch();
    return {
        user: useAppSelector((state) => state.user),
        setUser: (user: UserState) => {
            dispatch(setUser(user))
        },
        clearUser: () => {
            dispatch(clearUser())
        }
    }
}
