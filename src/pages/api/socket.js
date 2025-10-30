// pages/api/socket.js
import { Server } from "socket.io";

let io;
let sessions = {};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing Socket.IO server...");
    
    io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"], // Polling first
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      allowEIO3: true, // Compatibility
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("✅ New client connected:", socket.id);

      // Create quiz session with questions
      socket.on("create_session", ({ pin, quizId, questions }) => {
        sessions[pin] = {
          quizId,
          host: socket.id,
          students: [],
          questions: questions || [],
          currentQuestion: 0,
          questionStartTime: null,
        };
        socket.join(pin);
        console.log(`📝 Session created with PIN: ${pin}, Questions: ${questions?.length || 0}`);
      });

      // Student joins
      socket.on("join_session", ({ pin, nickname, userId }) => {
        console.log(`🧑‍🎓 ${nickname} (userId: ${userId}) trying to join PIN: ${pin}`);
        
        if (!sessions[pin]) {
          console.log(`❌ Invalid PIN: ${pin}`);
          socket.emit("error_message", "Invalid PIN");
          return;
        }

        const student = {
          id: socket.id,
          userId,
          nickname,
          score: 0,
        };

        sessions[pin].students.push(student);
        socket.join(pin);
        console.log(`✅ ${nickname} joined session ${pin}. Total students: ${sessions[pin].students.length}`);

        // Send current question if quiz already started
        if (sessions[pin].questionStartTime) {
          socket.emit("new_question", {
            question: sessions[pin].questions[sessions[pin].currentQuestion],
            questionNumber: sessions[pin].currentQuestion + 1,
            totalQuestions: sessions[pin].questions.length,
          });
        }

        // Broadcast updated leaderboard to everyone in the room
        io.to(pin).emit("update_leaderboard", sessions[pin].students);
      });

      // Host starts quiz
      socket.on("start_quiz", (pin) => {
        console.log(`🎯 Host starting quiz for PIN: ${pin}`);
        
        if (!sessions[pin]) {
          console.log(`❌ Session not found for PIN: ${pin}`);
          socket.emit("error_message", "Session not found");
          return;
        }

        if (sessions[pin].questions.length === 0) {
          console.log(`❌ No questions for PIN: ${pin}`);
          socket.emit("error_message", "No questions found");
          return;
        }

        sessions[pin].currentQuestion = 0;
        sessions[pin].questionStartTime = Date.now();

        const question = sessions[pin].questions[0];
        
        const questionData = {
          question: {
            id: question.id,
            question: question.question,
            answers: question.answers.map((ans) => ({
              id: ans.id,
              answer_text: ans.answer_text,
            })),
          },
          questionNumber: 1,
          totalQuestions: sessions[pin].questions.length,
        };

        io.to(pin).emit("new_question", questionData);
        console.log(`📝 Sent question 1 to all clients in room ${pin}`);
      });

      // Student submits answer
      socket.on("submit_answer", ({ pin, userId, answerId }) => {
        console.log(`📨 Answer received - PIN: ${pin}, userId: ${userId}, answerId: ${answerId}`);
        
        if (!sessions[pin]) {
          console.log(`❌ Session not found for PIN: ${pin}`);
          return;
        }

        const session = sessions[pin];
        const currentQ = session.questions[session.currentQuestion];
        const student = session.students.find((s) => s.userId === userId);

        if (!student) {
          console.log(`❌ Student not found: userId ${userId}`);
          return;
        }

        // Check if answer is correct
        const selectedAnswer = currentQ.answers.find((a) => a.id === answerId);
        
        if (selectedAnswer && selectedAnswer.is_correct) {
          // Calculate score based on time taken
          const timeTaken = Date.now() - session.questionStartTime;
          const basePoints = 100;
          const timeBonus = Math.max(0, 50 - Math.floor(timeTaken / 1000));
          const points = basePoints + timeBonus;

          student.score += points;
          console.log(`✅ ${student.nickname} answered correctly! +${points} points (Total: ${student.score})`);
        } else {
          console.log(`❌ ${student.nickname} answered incorrectly`);
        }

        // Broadcast updated leaderboard
        io.to(pin).emit("update_leaderboard", session.students);
      });

      // Host moves to next question
      socket.on("next_question", (pin) => {
        console.log(`➡️ Next question requested for PIN: ${pin}`);
        
        if (!sessions[pin]) {
          console.log(`❌ Session not found for PIN: ${pin}`);
          return;
        }

        const session = sessions[pin];
        session.currentQuestion++;

        if (session.currentQuestion >= session.questions.length) {
          // Quiz finished
          const leaderboard = session.students.sort((a, b) => b.score - a.score);
          io.to(pin).emit("quiz_finished", { leaderboard });
          console.log(`🏁 Quiz finished in session ${pin}`);
          return;
        }

        session.questionStartTime = Date.now();
        const question = session.questions[session.currentQuestion];

        const questionData = {
          question: {
            id: question.id,
            question: question.question,
            answers: question.answers.map((ans) => ({
              id: ans.id,
              answer_text: ans.answer_text,
            })),
          },
          questionNumber: session.currentQuestion + 1,
          totalQuestions: session.questions.length,
        };

        io.to(pin).emit("new_question", questionData);
        console.log(`📝 Sent question ${session.currentQuestion + 1} to room ${pin}`);
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
        
        for (const pin in sessions) {
          const initialLength = sessions[pin].students.length;
          sessions[pin].students = sessions[pin].students.filter(
            (s) => s.id !== socket.id
          );
          
          if (sessions[pin].students.length < initialLength) {
            console.log(`🚪 Student left from PIN ${pin}. Remaining: ${sessions[pin].students.length}`);
            io.to(pin).emit("update_leaderboard", sessions[pin].students);
          }
        }
      });
    });
  } else {
    console.log("⚡ Socket.IO already running");
  }

  res.end();
}
