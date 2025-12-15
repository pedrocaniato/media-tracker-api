-- DropForeignKey
ALTER TABLE "public"."UserMedia" DROP CONSTRAINT "UserMedia_mediaId_fkey";

-- DropIndex
DROP INDEX "public"."UserMedia_userId_mediaId_key";

-- AlterTable
ALTER TABLE "public"."UserMedia" ALTER COLUMN "mediaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."UserMedia" ADD CONSTRAINT "UserMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
