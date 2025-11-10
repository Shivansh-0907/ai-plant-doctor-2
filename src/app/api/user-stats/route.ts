import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, session } from "@/db/schema";
import { count, gt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get total number of users
    const totalUsersResult = await db.select({ count: count() }).from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active users (users with valid sessions that haven't expired)
    const now = new Date();
    const activeUsersResult = await db
      .select({ count: count() })
      .from(session)
      .where(gt(session.expiresAt, now));
    const activeUsers = activeUsersResult[0]?.count || 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
