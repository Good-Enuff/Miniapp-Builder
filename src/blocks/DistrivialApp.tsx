import { useState, useEffect } from 'react';
import { BlockModel, ComposerComponentProps, FeedComponentProps } from './types';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const decodeHTML = (html: string) => {
  const text = document.createElement('textarea');
  text.innerHTML = html;
  return text.value;
};

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

const fetchQuestions = async (): Promise<Question[]> => {
  const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple');
  const data = await response.json();
  return data.results.map((item: any) => ({
    question: decodeHTML(item.question),
    correct_answer: decodeHTML(item.correct_answer),
    incorrect_answers: item.incorrect_answers.map((ans: string) => decodeHTML(ans)),
  }));
};

let _questions: Question[] = [];
let _userScore: number = 0;
let _userAnswers: string[] = [];
let _correctAnswers: string[] = [];

export const DistrivialFeedComponent = ({ model }: FeedComponentProps) => {
  return (
    <div className="results-container">
      <style>{`
        .results-container {
          padding: 20px;
          text-align: center;
        }
        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-radius: 10px;
          padding: 10px;
          background-color: #f9f9f9;
        }
        .question-text {
          flex-grow: 1;
          text-align: left;
          margin-right: 10px;
          background-color: #e0e0e0;
          padding: 10px;
          border-radius: 10px;
        }
        .answer-correct {
          background-color: #4CAF50; /* Green */
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
        .answer-incorrect {
          background-color: #F44336; /* Red */
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
      `}</style>
      <h1>User score: {_userScore} out of {_questions.length}</h1>
      {_questions.map((question, index) => (
        <div key={index} className="result-row">
          <div className="question-text">{question.question}</div>
          <div
            className={
              _userAnswers[index] === question.correct_answer
                ? 'answer-correct'
                : 'answer-incorrect'
            }
          >
            {_userAnswers[index]}
          </div>
        </div>
      ))}
    </div>
  );
};

export const DistrivialComposerComponent = ({ model, done }: ComposerComponentProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]); // new state variable
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions()
      .then((questions) => {
        setQuestions(questions);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleAnswer = (answer: string) => {
    const current = questions[currentQuestion];
    const correctAnswer = current.correct_answer;
    setCorrectAnswers((prevCorrectAnswers) => [...prevCorrectAnswers, correctAnswer]);
    if (answer === current.correct_answer) {
      setUserScore(userScore + 1);
    }
    setUserAnswers((prevAnswers) => [...prevAnswers, answer]);
    setCurrentQuestion(currentQuestion + 1);
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <div><h1>Error</h1><p>{error}</p></div>;
  }

  if (currentQuestion >= questions.length) {
    _questions = questions;
    _userScore = userScore;
    _userAnswers = userAnswers;
    _correctAnswers = correctAnswers;

    done(model);

    return (
      <div className="results-container">
        <style>{`
        .results-container {
          padding: 20px;
          text-align: center;
        }
        .result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-radius: 10px;
          padding: 10px;
          background-color: #f9f9f9;
        }
        .question-text {
          flex-grow: 1;
          text-align: left;
          margin-right: 10px;
          background-color: #e0e0e0;
          padding: 10px;
          border-radius: 10px;
        }
        .answer-correct {
          background-color: #4CAF50; /* Green */
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
        .answer-incorrect {
          background-color: #F44336; /* Red */
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
      `}</style>
        <h1>User score: {_userScore} out of {_questions.length}</h1>
        {_questions.map((question, index) => (
          <div key={index} className="result-row">
            <div className="question-text">{question.question}</div>
            <div
              className={
                _userAnswers[index] === question.correct_answer
                  ? 'answer-correct'
                  : 'answer-incorrect'
              }
            >
              {_userAnswers[index]}
            </div>
          </div>
        ))}
        <button className="question-text" onClick={() => { done(model) }}>Post</button>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const shuffledAnswers = shuffleArray([...current.incorrect_answers, current.correct_answer]);

  return (
    <div className="question-container">
      <style>{`
        .question-container {
          text-align: center;
          margin-top: 20px;
        }
        .answer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 20px auto;
          max-width: 400px;
        }
        .answer-button {
          padding: 15px;
          background-color: #f0f0f0;
          border: 2px solid #ccc;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          text-align: center;
          transition: background-color 0.3s, border-color 0.3s;
        }
        .answer-button:hover,
        .answer-button:focus {
          background-color: #e0e0e0;
          border-color: #888;
        }
      `}</style>
      <h1>Question {currentQuestion + 1}</h1>
      <p>{current.question}</p>
      <div className="answer-grid">
        {shuffledAnswers.map((answer, index) => (
          <button
            key={index}
            className="answer-button"
            onClick={() => handleAnswer(answer)}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
};