import Link from "next/link";

export default function Home() {
  return (
    <div className="h-[150vh]">
      <div className="flex flex-col gap-4 justify-start items-center">
        <p className="text-2xl font-bold">Home</p>
        <Link href="/sign-in">Click to sign in</Link>
        <Link href="/sign-up">Click to sign up</Link>
      </div>
    </div>
  );
}
