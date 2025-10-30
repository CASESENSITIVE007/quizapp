'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  uid: number;
  username: string;
  email: string;
  role: 'student' | 'teacher';
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 text-lg font-medium">Loading profile...</div>
      </div>
    );
  }

  function gotoquiz() {
    router.push('/quiz');
  }
  function gotojoinquiz() {
    router.push('/join');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 bg-gradient-to-br from-indigo-50 to-white">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Dashboard</h1>
      {user ? (
        <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Welcome, {user.user.username}!</h2>
          <div className="space-y-5 text-gray-700">
            <p className="flex items-center space-x-2 text-base">
              <span className="font-semibold text-gray-800">User ID:</span> <span>{user.user.uid}</span>
            </p>
            <p className="flex items-center space-x-2 text-base">
              <span className="font-semibold text-gray-800">Email:</span> <span>{user.user.email}</span>
            </p>
            <p className="flex items-center space-x-2 text-base">
              <span className="font-semibold text-gray-800">Role:</span>{' '}
              <span className="capitalize bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                {user.user.role}
              </span>
            </p>
            <div>
              {user.user.role === 'teacher' ? (
                <button
                  onClick={gotoquiz}
                  className="w-full py-2 rounded-xl border-2 border-indigo-500 text-indigo-700 font-semibold hover:bg-indigo-100 transition"
                >
                  Quizzes
                </button>
              ) : (
                <button
                  onClick={gotojoinquiz}
                  className="w-full py-2 rounded-xl border-2 border-indigo-500 text-indigo-700 font-semibold hover:bg-indigo-100 transition"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-center text-lg">Could not load user information.</p>
      )}
    </div>
  );
}
