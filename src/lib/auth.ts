import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export async function getUserFromToken(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) return null;

    const payload = verifyToken(token);

    if (!payload) return null;

    return { id: payload.userId };
}
