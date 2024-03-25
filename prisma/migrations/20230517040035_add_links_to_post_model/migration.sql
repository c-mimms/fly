-- CreateTable
CREATE TABLE "_LinkedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LinkedPosts_AB_unique" ON "_LinkedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_LinkedPosts_B_index" ON "_LinkedPosts"("B");

-- AddForeignKey
ALTER TABLE "_LinkedPosts" ADD CONSTRAINT "_LinkedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinkedPosts" ADD CONSTRAINT "_LinkedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
