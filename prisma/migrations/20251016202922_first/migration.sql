-- CreateTable
CREATE TABLE "SmartFrame" (
    "id" TEXT NOT NULL,
    "kolorRamy" TEXT NOT NULL,
    "kolorSzkla" TEXT NOT NULL,
    "szerokosc" DOUBLE PRECISION NOT NULL,
    "wysokosc" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SmartFrame_pkey" PRIMARY KEY ("id")
);
