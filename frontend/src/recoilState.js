// recoilState.js
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const authTokenState = atom({
  key: "authToken",
  default: "",
  effects_UNSTABLE: [persistAtom],
});

export const userState = atom({
  key: "user",
  default: "",
  effects_UNSTABLE: [persistAtom],
});
