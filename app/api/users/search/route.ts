import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            media: {
              where: { status: "VISTO" }
            }
          }
        }
      },
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
