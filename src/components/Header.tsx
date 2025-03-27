import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="flex space-x-4 container mx-auto">
        <Link href="/" className="hover:underline">
          ホーム
        </Link>
        <Link href="/about" className="hover:underline">
          自己紹介
        </Link>
        <Link href="/projects" className="hover:underline">
          プロジェクト
        </Link>
      </nav>
    </header>
  );
}
