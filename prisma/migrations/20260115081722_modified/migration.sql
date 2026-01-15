/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "billingDate" TIMESTAMP(3),
ADD COLUMN     "chatCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "friends" JSONB,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "genderMatch" TEXT NOT NULL DEFAULT 'random',
ADD COLUMN     "giftsSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "pfpUrl" TEXT,
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editName" BOOLEAN NOT NULL DEFAULT false,
    "editPfp" BOOLEAN NOT NULL DEFAULT false,
    "minMatchTime" INTEGER NOT NULL DEFAULT 30,
    "selectGender" BOOLEAN NOT NULL DEFAULT false,
    "sendGifs" BOOLEAN NOT NULL DEFAULT false,
    "sendEmojis" BOOLEAN NOT NULL DEFAULT false,
    "friendReq" BOOLEAN NOT NULL DEFAULT false,
    "chatCooldown" INTEGER NOT NULL DEFAULT 0,
    "maxDailyChats" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "chats" JSONB NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
