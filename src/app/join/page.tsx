"use client";

import { useEffect, useState } from "react";
import { getSocket } from "../../../lib/socket";
import axios from "axios";

interface Answer {
  id: number;
  answer_text: string;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export default function JoinQuizPage() {
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Setup socket listeners ONCE on mount
  useEffect(() => {
    console.log("🔌 Setting up socket listeners...");
    const socket = getSocket();

    socket.on("error_message", (msg: string) => {
      console.error("❌ Error from server:", msg);
      setError(msg);
    });

    socket.on("new_question", (data: any) => {
      console.log("📝 New question received:", data);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setSelectedAnswer(null);
      setAnswered(false);
    });

    socket.on("update_leaderboard", (students: any[]) => {
      console.log("📊 Leaderboard update received. Students:", students.length);
      if (userId) {
        const myScore = students.find((s) => s.userId === userId);
        if (myScore) {
          console.log("💯 My score updated:", myScore.score);
          setFinalScore(myScore.score);
        }
      }
      setLeaderboard(students);
    });

    socket.on("quiz_finished", (data: any) => {
      console.log("🏁 Quiz finished event received");
      setQuizFinished(true);
      setLeaderboard(data.leaderboard);
      if (userId) {
        const myData = data.leaderboard.find((s: any) => s.userId === userId);
        if (myData) {
          setFinalScore(myData.score);
        }
      }
    });

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("error_message");
      socket.off("new_question");
      socket.off("update_leaderboard");
      socket.off("quiz_finished");
    };
  }, [userId]); // Re-run if userId changes

  const handleJoin = async () => {
    if (!nickname.trim() || !pin.trim()) {
      setError("Please enter both nickname and PIN");
      return;
    }

    try {
      console.log("🔐 Getting user info...");
      const userRes = await axios.get("/api/auth/me");
      const uid = userRes.data.user.uid;
      console.log("✅ User ID:", uid);
      setUserId(uid);

      console.log("🚀 Joining session with PIN:", pin);
      const socket = getSocket();
      
      // Make sure socket is connected before emitting
      if (!socket.connected) {
        console.log("⏳ Socket not connected, waiting...");
        await new Promise((resolve) => {
          socket.once("connect", resolve);
        });
      }

      socket.emit("join_session", { pin, nickname, userId: uid });
      console.log("📤 Join session event emitted");

      setJoined(true);
      setError("");
    } catch (err: any) {
      console.error("❌ Failed to join:", err);
      setError(err.response?.data?.error || "Failed to join. Are you logged in?");
    }
  };

  const handleAnswerSelect = (answerId: number) => {
    if (answered) return;
    console.log("🔘 Answer selected:", answerId);
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answered) return;

    console.log("📤 Submitting answer:", selectedAnswer);
    const socket = getSocket();
    socket.emit("submit_answer", { pin, userId, answerId: selectedAnswer });
    setAnswered(true);
  };

  // Quiz finished screen
  if (quizFinished) {
    const myRank = leaderboard.findIndex((s) => s.userId === userId) + 1;
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🏁 Quiz Finished!</h1>
        
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-lg mb-2">Your Final Score</p>
          <p className="text-5xl font-bold text-blue-600">{finalScore}</p>
          <p className="text-gray-600 mt-2">Rank: #{myRank}</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Final Leaderboard</h2>
          <ul className="space-y-2">
            {leaderboard.map((student, index) => (
              <li
                key={student.id}
                className={`flex justify-between items-center p-3 rounded ${
                  student.userId === userId ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold">#{index + 1}</span>
                  <span>{student.nickname}</span>
                </div>
                <span className="font-bold text-blue-600">{student.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Waiting for quiz to start
  if (joined && !currentQuestion) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">✅ Joined Successfully!</h1>
        <p className="text-lg mb-2">Welcome, <strong>{nickname}</strong>!</p>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
          <p className="text-gray-700">⏳ Waiting for the host to start the quiz...</p>
          <p className="text-xs text-gray-500 mt-2">Listening for questions...</p>
        </div>
        <p className="text-sm text-gray-500 mt-4">Current Score: {finalScore}</p>
        
        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
          <p><strong>Debug Info:</strong></p>
          <p>Socket Connected: {getSocket().connected ? "✅ Yes" : "❌ No"}</p>
          <p>User ID: {userId}</p>
          <p>PIN: {pin}</p>
        </div>
      </div>
    );
  }

  // Question screen
  if (joined && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Question {questionNumber} of {totalQuestions}
          </h2>
          <p className="text-lg font-bold text-blue-600">Score: {finalScore}</p>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-lg mb-6">
          <h3 className="text-2xl font-semibold text-black mb-6">{currentQuestion.question}</h3>

          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                disabled={answered}
                className={`w-full p-4 text-left border-2 rounded-lg text-black font-medium transition-all ${
                  selectedAnswer === answer.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                } ${answered ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                {answer.answer_text}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null || answered}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {answered ? "✅ Answer Submitted" : "Submit Answer"}
        </button>

        {answered && (
          <p className="text-center text-gray-600 mt-4">
            ⏳ Waiting for next question...
          </p>
        )}
      </div>
    );
  }

  // Join screen
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Join Quiz</h1>

      {error && (
        <p className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Your Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Session PIN</label>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Enter 6-digit PIN"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleJoin}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Join Quiz
        </button>
      </div>
    </div>
  );
}
