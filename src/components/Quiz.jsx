import React, { useState, useEffect } from "react";
import questions from "../question";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds for each question
  const [showAnswer, setShowAnswer] = useState(false); // To reveal correct/incorrect answers
  const [quizCompleted, setQuizCompleted] = useState(false); // Flag for quiz completion
  const [attempts, setAttempts] = useState([]); // Array to store attempt scores

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
        setFeedback("Wrong!");
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
      // Record the score for this attempt and mark the quiz as completed
      setAttempts((prevAttempts) => [...prevAttempts, score]);
      setQuizCompleted(true);
    }
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
        <h3>Attempt History</h3>
        <ul>
          {attempts.map((attemptScore, index) => (
            <li key={index}>
              Attempt {index + 1}: {attemptScore}/{questions.length}
            </li>
          ))}
        </ul>
        <p>Total Attempts: {attempts.length}</p>
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
            // Determine the button color based on selected and correct answers
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
                  pointerEvents: showAnswer ? "none" : "auto", // Disable after submission
                }}
              >
                {option}
              </button>
            );
          })
        ) : (
          <input
            type="number"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Enter your answer"
            style={{ padding: "5px", margin: "10px" }}
          />
        )}
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
