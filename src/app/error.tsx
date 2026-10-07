"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="grid min-h-[60svh] place-items-center bg-[#0b0f12] px-4 text-center">
      <div>
        <p className="eyebrow">Lỗi kỹ thuật</p>
        <h1 className="mt-5 text-4xl font-black text-white">Không thể hiển thị nội dung</h1>
        <p className="mt-4 text-[#b8bec7]">Vui lòng thử tải lại phần này.</p>
        <button type="button" onClick={() => reset()} className="button-primary mt-7">
          Thử lại
        </button>
      </div>
    </section>
  );
}
