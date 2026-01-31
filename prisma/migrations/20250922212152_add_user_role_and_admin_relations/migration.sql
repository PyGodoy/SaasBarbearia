-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CLIENT', 'BARBERSHOP_ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "public"."BarbershopAdmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarbershopAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BarbershopAdmin_userId_barbershopId_key" ON "public"."BarbershopAdmin"("userId", "barbershopId");

-- AddForeignKey
ALTER TABLE "public"."BarbershopAdmin" ADD CONSTRAINT "BarbershopAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BarbershopAdmin" ADD CONSTRAINT "BarbershopAdmin_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "public"."Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
