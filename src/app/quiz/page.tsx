"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Quiz {
  id: number;
  title: string;
  description: string;
  creator: {
    uid: number;
    username: string;
  };
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch user-created quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await axios.get<Quiz[]>("/api/quizzes");
      setQuizzes(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.error("Failed to fetch quizzes:", error.response?.data || error);
    }
  };

  // ✅ Handle new quiz creation
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await axios.post("/api/quizzes", { title, description });
      setTitle("");
      setDescription("");
      setShowForm(false);
      fetchQuizzes(); // refresh list
    } catch (error: any) {
      console.error("Failed to create quiz:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Quizzes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "+ Create Quiz"}
        </button>
      </div>

      {/* Quiz creation form (toggleable) */}
      {showForm && (
        <form
          onSubmit={handleCreateQuiz}
          className="mb-8 p-6 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">New Quiz</h2>
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded-md resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-green-400"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {/* Quizzes list */}
      <div className="space-y-6">
        {quizzes.length === 0 ? (
          <p className="text-gray-500 italic">No quizzes created yet.</p>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-6 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center bg-white hover:shadow-md transition"
            >
              <div className="max-w-[70%]">
                <h3 className="text-2xl font-semibold text-gray-900">{quiz.title}</h3>
                <p className="mt-1 text-gray-700">{quiz.description}</p>
                <p className="mt-2 text-sm text-gray-500">
                  Created by <span className="font-medium text-gray-800">{quiz.creator.username}</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/quiz/${quiz.qid}/questions`}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
                >
                  Manage
                </Link>
                <Link
                  href={`/quiz/${quiz.qid}`}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                >
                  Start
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
