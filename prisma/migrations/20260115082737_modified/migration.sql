/*
  Warnings:

  - You are about to drop the column `chatCooldown` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `friendReq` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "chatCooldown",
DROP COLUMN "friendReq",
DROP COLUMN "link",
ADD COLUMN     "chatTimer" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "maxFriendReq" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sendVideos" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "minMatchTime" SET DEFAULT 60,
ALTER COLUMN "maxDailyChats" SET DEFAULT 20;
