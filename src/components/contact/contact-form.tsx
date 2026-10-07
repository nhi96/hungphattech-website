"use client";

import { Send } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { categories } from "@/data/categories";
import {
  type ContactErrors,
  type ContactValues,
  validateContact,
} from "@/lib/contact-validation";

const initialValues: ContactValues = {
  name: "",
  phone: "",
  category: "",
  message: "",
};

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [checked, setChecked] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setChecked(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    setChecked(Object.keys(nextErrors).length === 0);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        if (nextErrors.name) nameRef.current?.focus();
        else if (nextErrors.phone) phoneRef.current?.focus();
      });
    }
  };

  const fieldClass =
    "min-h-12 w-full border border-[#cdd1d5] bg-white px-4 text-[#0b0f12] placeholder:text-[#7a8189] focus:border-[#0b0f12] focus:outline-none";

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" aria-label="Biểu mẫu yêu cầu tư vấn">
      {Object.keys(errors).length > 0 ? (
        <div
          id="contact-error-summary"
          role="alert"
          className="border-l-4 border-[#a83220] bg-[#fff0ed] p-4 font-semibold text-[#7f2417]"
        >
          Vui lòng kiểm tra các trường được đánh dấu bên dưới.
        </div>
      ) : null}
      <div>
        <label htmlFor="contact-name" className="mb-2 block text-sm font-bold text-[#0b0f12]">
          Họ và tên <span aria-hidden>*</span>
        </label>
        <input
          id="contact-name"
          ref={nameRef}
          className={fieldClass}
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          autoComplete="name"
        />
        {errors.name ? (
          <p id="contact-name-error" className="mt-2 text-sm font-semibold text-[#a83220]">
            {errors.name}
          </p>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-bold text-[#0b0f12]">
            Số điện thoại <span aria-hidden>*</span>
          </label>
          <input
            id="contact-phone"
            ref={phoneRef}
            className={fieldClass}
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.phone ? (
            <p id="contact-phone-error" className="mt-2 text-sm font-semibold text-[#a83220]">
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-category" className="mb-2 block text-sm font-bold text-[#0b0f12]">
            Nhóm sản phẩm quan tâm
          </label>
          <select
            id="contact-category"
            className={fieldClass}
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">Chọn nhóm sản phẩm</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-bold text-[#0b0f12]">
          Nội dung
        </label>
        <textarea
          id="contact-message"
          className={`${fieldClass} min-h-32 py-3`}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Mô tả nhu cầu của bạn..."
        />
      </div>
      <div className="border-l-4 border-[#ffc400] bg-[#fff8d5] p-4 text-sm leading-6 text-[#5c4700]">
        Bản local đang ở chế độ thử nghiệm. Biểu mẫu không gửi, lưu hoặc chuyển dữ liệu tới
        doanh nghiệp.
      </div>
      <button type="submit" className="button-dark w-fit">
        <Send size={18} aria-hidden />
        Kiểm tra yêu cầu
      </button>
      {checked ? (
        <p role="status" className="border border-[#b98f00] bg-[#fff8d5] p-4 font-bold text-[#5c4700]">
          Bản thử nghiệm: thông tin chưa được gửi tới doanh nghiệp.
        </p>
      ) : null}
    </form>
  );
}
