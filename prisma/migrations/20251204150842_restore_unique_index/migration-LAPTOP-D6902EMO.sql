/*
  Warnings:

  - A unique constraint covering the columns `[userId,mediaId]` on the table `UserMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserMedia_userId_mediaId_key" ON "public"."UserMedia"("userId", "mediaId");
