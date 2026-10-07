import Link from "next/link";

export default function NotFound() {
  return (
    <section className="grid min-h-[70svh] place-items-center bg-[#0b0f12] px-4 py-20 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-5 text-5xl font-black text-white">Không tìm thấy trang</h1>
        <p className="mt-4 text-[#b8bec7]">Đường dẫn có thể đã thay đổi hoặc chưa được tạo.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="button-primary">
            Về trang chủ
          </Link>
          <Link href="/san-pham" className="button-secondary">
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
}
