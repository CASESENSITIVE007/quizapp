"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function TeacherPage() {
  const [pin, setPin] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("/api/socket"); // Initialize socket server
   const socket = io("/api/socket");

    socket.on("connect", () => console.log("✅ Connected to socket"));

    socket.on("update_leaderboard", (data) => {
      console.log("📊 Leaderboard updated:", data);
      setStudents(data);
    });

    return () => socket.disconnect();
  }, []);

  const handleCreateQuiz = () => {
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPin(generatedPin);
    socket.emit("create_quiz", generatedPin);
  };

  return (
    <div className="p-6">
      {!pin ? (
        <button
          onClick={handleCreateQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Quiz
        </button>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-3">Quiz PIN: {pin}</h2>
          <h3 className="text-lg mb-2">Students:</h3>
          {students.length === 0 ? (
            <p>No student yet</p>
          ) : (
            <ul className="space-y-1">
              {students.map((s) => (
                <li key={s.id}>
                  {s.name} — {s.score} pts
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
