-- CreateTable
CREATE TABLE "LetterConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "letterType" TEXT,
    "frontLetter" TEXT,
    "backLetter" TEXT,
    "frontLetterAdd" TEXT,
    "tapeDepth" TEXT,
    "tapeModel" TEXT,
    "tapeColor" TEXT,
    "lighting" TEXT,
    "mounting" TEXT,
    "substructure" TEXT,
    "dimmer" TEXT,
    "pathData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterConfiguration_pkey" PRIMARY KEY ("id")
);
