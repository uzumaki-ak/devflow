// src/app/api/developers/route.ts
// returns the full list of developers — used to populate the dev selector

import { NextResponse } from "next/server";
import developers from "@/data/developers.json";

// caching headers — developer list rarely changes, cache for 5 min
export const revalidate = 300;

export async function GET() {
  return NextResponse.json(developers);
}
