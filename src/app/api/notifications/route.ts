import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get all notifications for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get notifications for this user
    const notifications = await (prisma as any).Notification.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
      take: 50, // Limit to last 50 notifications
    });
    
    // Format the notifications for the frontend
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      content: notification.content,
      createdAt: notification.createdAt.toISOString(),
      read: notification.read,
      relatedId: notification.relatedId,
      sender: notification.sender ? notification.sender.name : null,
    }));
    
    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { notificationIds } = await request.json();
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: "Notification IDs are required" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Verify that all notifications belong to the user
    const notifications = await (prisma as any).Notification.findMany({
      where: {
        id: { in: notificationIds },
        receiverId: userId,
      },
    });
    
    if (notifications.length !== notificationIds.length) {
      return NextResponse.json(
        { error: "Some notifications do not belong to you" },
        { status: 403 }
      );
    }
    
    // Mark notifications as read
    await (prisma as any).Notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        read: true,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const notificationId = url.searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Verify that the notification belongs to the user
    const notification = await (prisma as any).Notification.findUnique({
      where: {
        id: notificationId,
      },
    });
    
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    
    if (notification.receiverId !== userId) {
      return NextResponse.json(
        { error: "This notification does not belong to you" },
        { status: 403 }
      );
    }
    
    // Delete the notification
    await (prisma as any).Notification.delete({
      where: {
        id: notificationId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
