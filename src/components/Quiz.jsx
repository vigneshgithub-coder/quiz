import React, { useState, useEffect } from "react";
import questions from "../question";
import { saveQuizAttempt, getQuizHistory } from "../services/indexedDB";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds for each question
  const [showAnswer, setShowAnswer] = useState(false); // To reveal correct/incorrect answers
  const [quizCompleted, setQuizCompleted] = useState(false); // Flag for quiz completion
  const [history, setHistory] = useState([]); // Store quiz history

  // Fetch quiz history from IndexedDB on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      const quizHistory = await getQuizHistory();
      setHistory(quizHistory);

      // Debug: Log history to the console
      console.log("Fetched Quiz History from IndexedDB:", quizHistory);
    };

    fetchHistory();
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft === 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Progress percentage and color
  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
  const progressColor = progressPercentage < 50 ? "#f44336" : "#4caf50";

  const handleTimeout = () => {
    setFeedback("Time's up!");
    setShowAnswer(true); // Reveal the correct answer
    setTimeout(() => {
      goToNextQuestion();
    }, 2000);
  };

  const handleAnswer = () => {
    const correctAnswer = questions[currentQuestion].correctAnswer;

    if (questions[currentQuestion].type === "MCQ") {
      if (selectedAnswer === correctAnswer) {
        setScore(score + 1);
        setFeedback("Correct!");
      } else {
        setFeedback("Wrong!");
      }
    } else if (questions[currentQuestion].type === "Integer") {
      const numericAnswer = parseInt(selectedAnswer, 10);

      if (numericAnswer === correctAnswer) {
        setScore(score + 1);
        setFeedback("Correct!");
      } else {
        setFeedback(`Wrong! The correct answer is ${correctAnswer}.`);
      }
    }

    setShowAnswer(true); // Reveal the correct/incorrect answers
    setTimeout(() => {
      goToNextQuestion();
    }, 2000);
  };

  const goToNextQuestion = () => {
    setFeedback("");
    setSelectedAnswer("");
    setShowAnswer(false); // Reset answer reveal

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30); // Reset timer for the next question
    } else {
      // Save the attempt to IndexedDB and fetch updated history
      saveQuizAttempt({ score, totalQuestions: questions.length }).then(() => {
        console.log("Saved Attempt to IndexedDB:", { score, totalQuestions: questions.length });
        fetchUpdatedHistory(); // Fetch updated history after saving
      });
      setQuizCompleted(true);
    }
  };

  // Fetch updated history
  const fetchUpdatedHistory = async () => {
    const updatedHistory = await getQuizHistory();
    setHistory(updatedHistory);
    console.log("Updated Quiz History from IndexedDB:", updatedHistory);
  };

  const restartQuiz = () => {
    // Reset all states to start the quiz again
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setFeedback("");
    setTimeLeft(30);
    setShowAnswer(false);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <div>
        <h2>Quiz Completed!</h2>
        <p>Your Score: {score}/{questions.length}</p>
        <button onClick={restartQuiz}>Try Again</button>

        <h3>Quiz History</h3>
        <ul>
          {history.map((attempt, index) => (
            <li key={index}>
              Attempt {index + 1}: {attempt.score}/{attempt.totalQuestions} on{" "}
              {new Date(attempt.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
        <p>Total Attempts: {history.length}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Question {currentQuestion + 1}</h2>
      <p>{questions[currentQuestion].question}</p>
      <div>
        {questions[currentQuestion].type === "MCQ" ? (
          questions[currentQuestion].options.map((option, index) => {
            let backgroundColor = "#f0f0f0"; // Default color
            if (showAnswer) {
              if (option === questions[currentQuestion].correctAnswer) {
                backgroundColor = "#4caf50"; // Green for correct answer
              } else if (option === selectedAnswer) {
                backgroundColor = "#f44336"; // Red for wrong answer
              }
            } else if (selectedAnswer === option) {
              backgroundColor = "#ADD8E6"; // Light blue for selected option
            }

            return (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                style={{
                  margin: "5px",
                  padding: "10px",
                  border: "none",
                  borderRadius: "5px",
                  backgroundColor,
                  cursor: "pointer",
                  pointerEvents: showAnswer ? "none" : "auto",
                }}
              >
                {option}
              </button>
            );
          })
        ) : (
          <>
            <input
              type="number"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Enter your answer"
              style={{
                padding: "10px",
                margin: "10px 0",
                border: "1px solid",
                borderRadius: "5px",
                fontSize: "1rem",
                width: "100%",
                backgroundColor: showAnswer
                  ? parseInt(selectedAnswer, 10) === questions[currentQuestion].correctAnswer
                    ? "#d4edda" // Light green for correct answer
                    : "#f8d7da" // Light red for incorrect answer
                  : "#ffffff", // Default white
                borderColor: showAnswer
                  ? parseInt(selectedAnswer, 10) === questions[currentQuestion].correctAnswer
                    ? "#28a745" // Green for correct answer
                    : "#dc3545" // Red for incorrect answer
                  : "#cccccc", // Default gray
              }}
              disabled={showAnswer} // Disable the input after showing the result
            />
            {showAnswer && parseInt(selectedAnswer, 10) !== questions[currentQuestion].correctAnswer && (
              <p style={{ color: "#dc3545", marginTop: "5px" }}>
                Correct Answer: {questions[currentQuestion].correctAnswer}
              </p>
            )}
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: progressColor,
          }}
        ></div>
      </div>

      <p>Time Left: {timeLeft} seconds</p>
      <button onClick={handleAnswer} disabled={!selectedAnswer || showAnswer}>
        Submit Answer
      </button>
      {feedback && <p>{feedback}</p>}
      <p>Score: {score}</p>
    </div>
  );
};

export default Quiz;
