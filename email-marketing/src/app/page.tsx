export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center p-10">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-2">EmailMarketing</h1>
        <p className="text-neutral-600 mb-6">Login to access the admin panel.</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-white text-sm hover:bg-neutral-800"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
