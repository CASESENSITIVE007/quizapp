"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "../../../../lib/socket";
import axios from "axios";

interface Student {
  id: string;
  userId: number;
  nickname: string;
  score: number;
}

interface Answer {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export default function QuizHostPage() {
  const params = useParams();
  const quizId = params.id as string;
  
  const [pin, setPin] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/quizzes/${quizId}/questions`);
        console.log("📚 Questions fetched:", res.data.length);
        setQuestions(res.data);
        setTotalQuestions(res.data.length);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        alert("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();

    socket.on("update_leaderboard", (updatedStudents: Student[]) => {
      console.log("📊 Leaderboard updated:", updatedStudents);
      setStudents(updatedStudents);
    });

    socket.on("quiz_finished", (data: any) => {
      console.log("🏁 Quiz finished");
      setQuizFinished(true);
      setStudents(data.leaderboard);
    });

    // Cleanup on unmount
    return () => {
      socket.off("update_leaderboard");
      socket.off("quiz_finished");
    };
  }, []);

  const handleStartSession = () => {
    if (questions.length === 0) {
      alert("Please add questions first!");
      return;
    }

    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(generatedPin);
    setSessionStarted(true);

    const socket = getSocket();
    socket.emit("create_session", { pin: generatedPin, quizId, questions });
    console.log("📝 Session created with PIN:", generatedPin);
  };

  const handleStartQuiz = () => {
    if (students.length === 0) {
      alert("Wait for at least one student to join!");
      return;
    }

    const socket = getSocket();
    socket.emit("start_quiz", pin);
    setQuizStarted(true);
    setCurrentQuestionNumber(1);
    console.log("🎯 Quiz started!");
  };

  const handleNextQuestion = () => {
    const socket = getSocket();
    socket.emit("next_question", pin);
    setCurrentQuestionNumber((prev) => prev + 1);
    console.log("➡️ Moving to next question");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p className="text-lg">Loading quiz...</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🏁 Quiz Finished!</h1>
        
        <div className="bg-white border rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Final Leaderboard</h2>
          
          {students.length === 0 ? (
            <p className="text-gray-500">No students participated</p>
          ) : (
            <ul className="space-y-3">
              {students.map((student, index) => (
                <li
                  key={student.id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    index === 0
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : index === 1
                      ? "bg-gray-100 border-2 border-gray-400"
                      : index === 2
                      ? "bg-orange-100 border-2 border-orange-400"
                      : "bg-gray-50 border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>
                    <span className="font-medium text-lg">{student.nickname}</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {student.score} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Quiz Host Dashboard</h1>

      {!sessionStarted ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📋 Questions loaded: <strong>{questions.length}</strong>
            </p>
            {questions.length === 0 && (
              <p className="text-red-600 text-sm mt-2">
                ⚠️ No questions found. Please add questions first.
              </p>
            )}
          </div>
          
          <button
            onClick={handleStartSession}
            disabled={questions.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🚀 Start Quiz Session
          </button>
        </div>
      ) : (
        <>
          {/* Session PIN Display */}
          <div className="mb-8 p-6 bg-green-100 border border-green-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-black">Session PIN</h2>
            <p className="text-4xl font-mono font-bold text-green-700">{pin}</p>
            <p className="text-sm text-gray-600 mt-2">
              Share this PIN with students to join
            </p>
          </div>

          {/* Start Quiz Button */}
          {!quizStarted ? (
            <div className="mb-6">
              <button
                onClick={handleStartQuiz}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xl font-semibold"
              >
                ▶️ Start Quiz {students.length > 0 ? `(${students.length} students ready)` : "(Waiting for students...)"}
              </button>
              {students.length === 0 && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  You can start even if no students have joined yet
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-lg font-semibold text-black">
                Question {currentQuestionNumber} of {totalQuestions}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {questions[currentQuestionNumber - 1]?.question}
              </p>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionNumber >= totalQuestions}
                className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {currentQuestionNumber >= totalQuestions ? "Finish Quiz" : "Next Question →"}
              </button>
            </div>
          )}

          {/* Live Leaderboard */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-black">
              Live Leaderboard ({students.length} students)
            </h3>
            
            {students.length === 0 ? (
              <p className="text-gray-500">Waiting for students to join...</p>
            ) : (
              <ul className="space-y-3">
                {students
                  .sort((a, b) => b.score - a.score)
                  .map((student, index) => (
                    <li
                      key={student.id}
                      className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 text-black">
                        <span className="font-bold text-lg">#{index + 1}</span>
                        <span className="font-medium">{student.nickname}</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {student.score} pts
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
