import { Cookies } from "react-cookie";

const cookies = new Cookies();

export const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let finalValue = value;

  // ✅ member 객체가 있으면 내부에 roleNames 있는지 보장
  if (typeof value === "object" && value?.member) {
    finalValue = {
      ...value,
      member: {
        ...value.member,
        roleNames: value.member.roleNames || [], // 없으면 빈 배열로라도
      },
    };
  }

  const stringValue =
    typeof finalValue === "string" ? finalValue : JSON.stringify(finalValue);

  return cookies.set(name, stringValue, {
    path: "/",
    expires,
    sameSite: "Lax",
    secure: false,
  });
};

export const getCookie = (name) => {
  const value = cookies.get(name);
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
};
