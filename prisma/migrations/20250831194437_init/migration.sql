-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('teacher', 'student');

-- CreateTable
CREATE TABLE "public"."User" (
    "uid" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "public"."Quizz" (
    "qid" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quizz_pkey" PRIMARY KEY ("qid")
);

-- CreateTable
CREATE TABLE "public"."QuestionTable" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnswerTable" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "AnswerTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameSessionTable" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "host_id" INTEGER NOT NULL,
    "pin" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSessionTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GamePlayerTable" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "GamePlayerTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerAnswersTable" (
    "id" SERIAL NOT NULL,
    "gameplayer_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "answered_at" INTEGER NOT NULL,

    CONSTRAINT "PlayerAnswersTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Quizz" ADD CONSTRAINT "Quizz_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionTable" ADD CONSTRAINT "QuestionTable_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."Quizz"("qid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnswerTable" ADD CONSTRAINT "AnswerTable_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."QuestionTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSessionTable" ADD CONSTRAINT "GameSessionTable_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."Quizz"("qid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameSessionTable" ADD CONSTRAINT "GameSessionTable_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayerTable" ADD CONSTRAINT "GamePlayerTable_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."GameSessionTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayerTable" ADD CONSTRAINT "GamePlayerTable_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerAnswersTable" ADD CONSTRAINT "PlayerAnswersTable_gameplayer_id_fkey" FOREIGN KEY ("gameplayer_id") REFERENCES "public"."GamePlayerTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerAnswersTable" ADD CONSTRAINT "PlayerAnswersTable_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."QuestionTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerAnswersTable" ADD CONSTRAINT "PlayerAnswersTable_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "public"."AnswerTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
