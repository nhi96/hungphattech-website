export const company = {
  legalName: "Công ty TNHH Thiết Bị Công Nghệ Hưng Phát",
  brandName: "HƯNG PHÁT",
  phones: [
    { display: "0937 100 368", value: "0937100368" },
    { display: "0357 985 073", value: "0357985073" },
  ],
  address: "B7-02 Khu Đô Thị Phú Mỹ Lộc, Phường Tam Quan, Tỉnh Gia Lai",
  plannedDomain: "hungphattech.net",
  isLocalPreview: true,
} as const;

export const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  company.address,
)}`;
