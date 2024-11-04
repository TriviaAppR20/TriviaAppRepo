import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../../../backend/firebase/firebase";
import { doc, collection, addDoc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const QuizzScreen = () => {
  const auth = getAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameCode, quizId } = route.params;
  const [gameId, setGameId] = useState(route.params?.gameId);
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [playersAnswered, setPlayersAnswered] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0); // Track player's score : D
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [bestPlayer, setBestPlayer] = useState(null);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [gameData, setGameData] = useState(null); // Store game data if needed
  
  // Fetch gameId if it’s missing
  useEffect(() => {
    const fetchGameId = async () => {
      if (gameCode && !gameId) {
        try {
          const gamesRef = collection(db, 'games');
          const querySnapshot = await getDocs(gamesRef);
          const game = querySnapshot.docs.find((doc) => doc.data().gameCode === gameCode);
          if (game) {
            setGameId(game.id);
          } else {
            console.error('Game with gameCode not found');
          }
        } catch (error) {
          console.error('Error fetching gameId:', error);
        }
      }
    };
    fetchGameId();
  }, [gameCode, gameId]);

  // Load questions from quiz document
  useEffect(() => {
    if (!quizId) return;
    const loadQuestions = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        if (quizDoc.exists()) {
          const questionsData = quizDoc.data().questions;
          setQuestions(questionsData || []);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };
    loadQuestions();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === 0) {
      proceedToNextQuestion(); // Proceed to the next question if time runs out
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Listen for players joining
  useEffect(() => {
    if (!gameId) return;
    const playersRef = collection(db, 'games', gameId, 'players');
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const playersList = snapshot.docs.map((doc) => doc.data());
      setPlayers(playersList);
    });
    return () => unsubscribePlayers();
  }, [gameId]);

  // Listen for answers
  useEffect(() => {
    if (!gameId) return;
    const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
    const unsubscribeAnswers = onSnapshot(currentAnswersRef, (snapshot) => {
      const answersList = snapshot.docs.map((doc) => doc.data());
      setPlayersAnswered(answersList.map((answer) => answer.playerId));
      
      // Check if all players have answered
      if (answersList.length === players.length) {
        proceedToNextQuestion();
      }
    });
    return () => unsubscribeAnswers();
  }, [gameId, players.length]);

  // Proceed to next question logic
  const proceedToNextQuestion = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(20); // Reset time
      setHasAnswered(false); // Allow player to answer next question
      clearAnswers(); // Clear current answers for the next question
    } else {
      completeQuiz();
    }
  };

  // Clear answers from Firestore for the next question
  const clearAnswers = async () => {
    const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
    const snapshot = await getDocs(currentAnswersRef);
    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref); // Use deleteDoc to delete each answer document
    });
  };


  // Check if answer is correct, submit answer, and update score
  const submitAnswer = async (selectedAnswer) => {
    if (hasAnswered) return;
    setHasAnswered(true);

    const currentQuestion = questions[questionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1); // Increment score for correct answer
    }

    try {
      const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
      await addDoc(currentAnswersRef, {
        playerId: auth.currentUser.uid,
        answer: selectedAnswer,
        isCorrect,
        submittedAt: new Date(),
      });
      console.log("Answer submitted successfully");
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

// Complete quiz and save final score
const completeQuiz = async () => {
  setIsQuizCompleted(true);
  const percentageScore = (score / questions.length) * 100;

  try {
    const playerRef = doc(db, 'games', gameId, 'players', auth.currentUser.uid);
    await setDoc(playerRef, {
      uid: auth.currentUser.uid,
      finalScore: score,
      percentageScore,
    }, { merge: true });
    
    console.log("Final score saved to database.");
    
    // Set the game ended state
    setIsGameEnded(true);
    
    // Call deleteGame after 30 seconds
    setTimeout(() => {
      deleteGame();
    }, 30000); // 30 seconds

    // Fetch the best player here if needed
    fetchBestPlayer();
  } catch (error) {
    console.error("Error saving final score:", error);
  }
};

const deleteGame = async () => {
  if (!gameId) return;

  try {
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef); // Deleting the game document

    console.log("Game deleted from database.");
  } catch (error) {
    console.error("Error deleting game:", error);
  }
};



const fetchBestPlayer = async () => {
  if (!gameId) return;

  try {
    const playersRef = collection(db, 'games', gameId, 'players');
    const snapshot = await getDocs(playersRef);

    let bestScore = -1;
    let bestPlayerData = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Debugging log for player data
      console.log("Player Data: ", data);

      // Check if the finalScore exists and is greater than bestScore
      if (data.finalScore !== undefined && data.finalScore > bestScore) {
        bestScore = data.finalScore;
        bestPlayerData = {
          uid: data.uid,
          finalScore: data.finalScore,
          percentageScore: (data.finalScore / questions.length) * 100,
        };
      }
    });

    // Check if we found a best player
    if (bestPlayerData) {
      console.log("Best Player Data: ", bestPlayerData);
      setBestPlayer(bestPlayerData);
    } else {
      console.log("No players have completed the quiz yet.");
      setBestPlayer(null); // Set best player to null if none found
    }
  } catch (error) {
    console.error("Error fetching best player:", error);
  }
};

// Call fetchBestPlayer when quiz is completed
useEffect(() => {
  if (isQuizCompleted) {
    fetchBestPlayer(); // Call the function to fetch the best player
  }
}, [isQuizCompleted, gameId]);

console.log("Best Player: ", bestPlayer);


return (
  <View>
    {!isQuizCompleted ? (
      <>
        {questions.length > 0 && questionIndex < questions.length && (
          <>
            <Text>{questions[questionIndex].questionText}</Text>
            {questions[questionIndex].answers.map((answer, index) => (
              <Button
                key={index}
                title={answer}
                onPress={() => submitAnswer(answer)}
                disabled={hasAnswered}
              />
            ))}
          </>
        )}
        <Text>Time left: {timeLeft}</Text>
      </>
    ) : (
      <View>
        <Text>Quiz Completed!</Text>
        {bestPlayer ? ( // Explicitly check if bestPlayer and its uid exist
          <>
            <Text>The BEST player was: {bestPlayer.uid}</Text>
            <Text>Final Score: {bestPlayer.finalScore}</Text>
            <Text>with a Percentage Score: {bestPlayer.percentageScore.toFixed(2)}%</Text>
          </>
        ) : (
          <Text>No players have completed the quiz.</Text>
        )}
        <Text>Your Score: {score} / {questions.length}</Text>
        <Text>Percentage: {((score / questions.length) * 100).toFixed(2)}%</Text>
      </View>
    )}
  </View>
);


};

export default QuizzScreen;