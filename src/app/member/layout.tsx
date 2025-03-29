"use client";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main className="container">{children}</main>
    </div>
  );
}
