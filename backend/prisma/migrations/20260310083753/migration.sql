-- DropIndex
DROP INDEX "ChatMessage_createdAt_idx";

-- DropIndex
DROP INDEX "ChatMessage_room_idx";

-- CreateIndex
CREATE INDEX "ChatMessage_room_createdAt_idx" ON "ChatMessage"("room", "createdAt" DESC);
