/*
  Warnings:

  - You are about to drop the column `maxClients` on the `BarbershopService` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Barbershop" ADD COLUMN     "barbersCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxClientsPerSlot" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."BarbershopService" DROP COLUMN "maxClients";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "barbershopId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "public"."Barbershop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
