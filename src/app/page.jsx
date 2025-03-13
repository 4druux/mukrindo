import Link from "next/link";

export default function Home() {
  return (
    <div className="text-orange-500 text-4xl font-bold tracking-widest text-center">
      Home
      <Link href="/sign-in">Click to sign in</Link>
      <Link href="/sign-up">Click to sign up</Link>
    </div>
  );
}
