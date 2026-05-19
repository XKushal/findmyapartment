import { SwaggerDocs } from "@/app/api-docs/swagger-docs";

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-zinc-200 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
          AllApartments API
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          API documentation
        </h1>
      </div>
      <SwaggerDocs />
    </main>
  );
}
