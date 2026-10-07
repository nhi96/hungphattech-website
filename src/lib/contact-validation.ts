export type ContactValues = {
  name: string;
  phone: string;
  category: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const phone = values.phone.replace(/[.\s-]/g, "");

  if (name.length < 2) {
    errors.name = "Vui lòng nhập họ tên.";
  }

  if (!/^0\d{9}$/.test(phone)) {
    errors.phone = "Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số.";
  }

  return errors;
}
