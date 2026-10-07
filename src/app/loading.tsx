export default function Loading() {
  return (
    <div className="grid min-h-[60svh] place-items-center bg-[#0b0f12]" role="status">
      <div className="text-center">
        <span className="mx-auto block size-10 animate-spin border-4 border-white/20 border-t-[#ffc400]" />
        <p className="mt-4 font-semibold text-[#b8bec7]">Đang tải nội dung...</p>
      </div>
    </div>
  );
}
