import { redis } from "./redis";
import { FrameNotificationDetails } from "@farcaster/frame-core";

function getUserNotificationDetailsKey(fid: number): string {
  return `user_notification_details:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<FrameNotificationDetails | null> {
  if (!redis) {
    console.warn("Redis not configured, skipping notification details retrieval");
    return null;
  }

  try {
    const result = await redis.get(getUserNotificationDetailsKey(fid));
    return result as FrameNotificationDetails | null;
  } catch (error) {
    console.error("Error getting notification details:", error);
    return null;
  }
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, skipping notification details storage");
    return;
  }

  try {
    await redis.set(getUserNotificationDetailsKey(fid), JSON.stringify(notificationDetails));
  } catch (error) {
    console.error("Error setting notification details:", error);
  }
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, skipping notification details deletion");
    return;
  }

  try {
    await redis.del(getUserNotificationDetailsKey(fid));
  } catch (error) {
    console.error("Error deleting notification details:", error);
  }
}
