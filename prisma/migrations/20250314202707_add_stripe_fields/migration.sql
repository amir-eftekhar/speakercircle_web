-- AlterTable
ALTER TABLE "Class" ADD COLUMN "stripePriceId" TEXT;
ALTER TABLE "Class" ADD COLUMN "stripeProductId" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "price" REAL;
ALTER TABLE "Event" ADD COLUMN "stripePriceId" TEXT;
ALTER TABLE "Event" ADD COLUMN "stripeProductId" TEXT;
