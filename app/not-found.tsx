import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="h-display max-w-lg text-4xl sm:text-5xl">
        This room doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-sm text-fog">
        The page you&apos;re looking for isn&apos;t on our floor plan.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-brass">
          Back to the entrance
        </Link>
        <Link href="/properties" className="btn-ghost">
          Browse homes
        </Link>
      </div>
    </div>
  );
}
