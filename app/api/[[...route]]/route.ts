import app from "@/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return app.fetch(request);
}

export async function POST(request: Request) {
  return app.fetch(request);
}
