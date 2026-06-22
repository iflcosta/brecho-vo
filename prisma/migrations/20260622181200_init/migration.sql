-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Brechó da Vovó',
    "instagramHandle" TEXT NOT NULL DEFAULT '@brechodavovo',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#E1306C',
    "secondaryColor" TEXT NOT NULL DEFAULT '#262626',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "defaultHashtags" TEXT NOT NULL DEFAULT '#brechó #modavintage #brechóonline',
    "contactInfo" TEXT,
    "paymentInfo" TEXT,
    "shippingInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "originalImage" TEXT NOT NULL,
    "garmentType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "description" TEXT,
    "generatedImage" TEXT,
    "caption" TEXT,
    "finalImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL DEFAULT 'hf',
    "inputImageUrl" TEXT NOT NULL,
    "outputImageUrl" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Generation_status_createdAt_idx" ON "Generation"("status", "createdAt");
