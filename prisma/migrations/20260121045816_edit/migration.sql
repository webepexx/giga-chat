/*
  Warnings:

  - A unique constraint covering the columns `[txnid]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txnid_key" ON "Payment"("txnid");
