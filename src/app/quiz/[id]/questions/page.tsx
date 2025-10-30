"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import axios from "axios";

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id?: number;
  question: string;
  answers: Answer[];
}

export default function QuestionsPage() {
  const { id } = useParams(); // quiz id from URL
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Question>({
    question: "",
    answers: [{ text: "", isCorrect: false }],
  });
  const [loading, setLoading] = useState(true);

  // Fetch existing questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/api/quizzes/${id}/questions`);
        setQuestions(res.data);
        console.log(res.data)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuestions();
  }, [id]);

  // Add answer field
  const addAnswerField = () => {
    setNewQuestion((prev) => ({
      ...prev,
      answers: [...prev.answers, { text: "", isCorrect: false }],
    }));
  };

  // Handle answer input change
  const handleAnswerChange = (index: number, field: keyof Answer, value: string | boolean) => {
    setNewQuestion((prev) => {
      const updatedAnswers = [...prev.answers];
      updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };
      return { ...prev, answers: updatedAnswers };
    });
  };

  // Submit new question
  const handleSubmit = async () => {
    try {
      const res = await axios.post(`/api/quizzes/${id}/questions`, newQuestion);
      setQuestions((prev) => [...prev, res.data]); 
      setNewQuestion({ question: "", answers: [{ text: "", isCorrect: false }] });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Questions for Quiz {id}</h1>

      {/* Show existing questions */}
      <div className="space-y-4 mb-8">
        {questions.length > 0 ? (
          questions.map((q, qIndex) => (
            <div key={qIndex} className="border p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg">{q.question}</h2>
              <ul className="mt-2 space-y-1">
                
                {q.answers.map((a, i) => (
                     
                  <li
                    key={i}
                    className={`pl-2 ${a.is_correct ? "text-green-600 font-medium" : "text-gray-700"}`}
                  >
                    - {a.answer_text}
                  </li>
                 
                ))}
                
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No questions added yet.</p>
        )}
      </div>

      {/* Form to add a question */}
      <div className="border p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">Add a New Question</h2>
        <input
          type="text"
          placeholder="Enter your question"
          value={newQuestion.question}
          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
          className="w-full p-2 border rounded mb-3"
        />

        {newQuestion.answers.map((ans, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder={`Answer ${index + 1}`}
              value={ans.text}
              onChange={(e) => handleAnswerChange(index, "text", e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={ans.isCorrect}
                onChange={(e) => handleAnswerChange(index, "isCorrect", e.target.checked)}
              />
              Correct
            </label>
          </div>
        ))}

        <div className="flex gap-3 mt-3">
          <button
            onClick={addAnswerField}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            + Add Answer
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
}
