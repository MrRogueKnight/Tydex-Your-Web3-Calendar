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

  return await redis.get<FrameNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: FrameNotificationDetails
): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, skipping notification details storage");
    return;
  }

  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, skipping notification details deletion");
    return;
  }

  await redis.del(getUserNotificationDetailsKey(fid));
}
