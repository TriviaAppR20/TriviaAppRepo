import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { db } from "../../../backend/firebase/firebase";
import { doc, collection, addDoc, getDoc, getDocs, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const QuizzScreen = () => {
  const auth = getAuth();
  const route = useRoute();
  const { gameCode, quizId } = route.params;
  const [gameId, setGameId] = useState(route.params?.gameId);
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [playersAnswered, setPlayersAnswered] = useState([]);
  const[playersTimedOut, setPlayersTimedOut] = useState([]);
  const [loadingBestPlayer, setLoadingBestPlayer] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [bestPlayer, setBestPlayer] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const navigation = useNavigation();


 //this has all kinds of stuff that needs to be looked over, 
 //probably has a lot of unnecessary stuff/bloat that can be remove

// game is fetched, and then displayed to all players.
// players choose answer to be submitted to the database.
// this is used to check if every one has answered ===
// if so, then the correct answer is displayed, and the next question is displayed.
// this is repeated until all questions are answered.
// running out of time also changes the question.

// correct answers are checked and saved for each player,
// at the end, the best player is displayed, and the game is deleted after 30 seconds.
// calcultions are made for personal performance as well.


// **note:!! if playing with browser and not with mobile, some bugs, mis-timings and skips
//can happen!!!!!
//WORKS ON MOBILE TO MOBILE


//if something is unclear,,, just paste a snippet to gbt and explain what is happening : DDD

  // Fetch gameId if missing
useEffect(() => {
  const fetchGameId = async () => {
    if (gameCode && !gameId) {
      const gamesRef = collection(db, 'games');
      const querySnapshot = await getDocs(gamesRef);
      const game = querySnapshot.docs.find((doc) => doc.data().gameCode === gameCode);
      if (game) setGameId(game.id);
      else console.error('Game with gameCode not found');
    }
  };
  fetchGameId();
}, [gameCode, gameId]);


  // Load questions from quizzes collection
useEffect(() => {
  if (!quizId) return;
  const loadQuestions = async () => {
    try {
      const quizDoc = await getDoc(doc(db, "quizzes", quizId));
      if (quizDoc.exists()) setQuestions(quizDoc.data().questions || []);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };
  loadQuestions();
}, [quizId]);


//managing tiemr in game,
//if time runs out, then the player is marked as timed out
//checks if all players have answered
//if not zero, setsup a timer
useEffect(() => {
  if (timeLeft === 0) {
    if (!hasAnswered) {
      const timedOutPlayersRef = collection(db, "games", gameId, "timedOutPlayers");
      addDoc(timedOutPlayersRef, { playerId: auth.currentUser.uid });
      setHasAnswered(true); // Prevent multiple updates
    }
    return;
  }

  const timer = setInterval(() => setTimeLeft((prevTime) => prevTime - 1), 1000);
  return () => clearInterval(timer); //this cleansup , makes sure that multiple timers are not running
}, [timeLeft, gameId, hasAnswered]);



//"wathching" for players who have timedout in the game and updating the app
//if gameid, creates reference to timedOutPlayers collection
//then listens for changes in the collection
useEffect(() => {
  if (!gameId) return;
  const timedOutPlayersRef = collection(db, 'games', gameId, 'timedOutPlayers');
  
  const unsubscribeTimedOut = onSnapshot(timedOutPlayersRef, (snapshot) => {
    const timedOutList = snapshot.docs.map((doc) => doc.data().playerId);
    setPlayersTimedOut(timedOutList);
  });

  return () => unsubscribeTimedOut(); //life saver
}, [gameId]);



//this is a bit more complex, but it listens for timedout players and current answers
//then compares the amount of players to the amount of timedout players and answered players

//creates list of players who have timed out
//then fetches the answers list from the currentAnswers collection
// to find which players have answered

//it updates the local state for players who have timed out and answered
useEffect(() => {
  if (!gameId) return;

  // Listen for both timedOutPlayers and currentAnswers
  const timedOutPlayersRef = collection(db, 'games', gameId, 'timedOutPlayers');
  const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');

  const unsubscribeTimedOutPlayers = onSnapshot(timedOutPlayersRef, async (timedOutSnapshot) => {
    const timedOutList = timedOutSnapshot.docs.map((doc) => doc.data());
    const timedOutPlayerIds = timedOutList.map((timedOut) => timedOut.playerId);
    
    // Fetch currentAnswers to get players who have answered
    const currentAnswersSnapshot = await getDocs(currentAnswersRef);
    const answersList = currentAnswersSnapshot.docs.map((doc) => doc.data());
    const answeredPlayerIds = answersList.map((answer) => answer.playerId);

    // Update local state for players who timed out and answered
    setPlayersTimedOut(timedOutPlayerIds);
    setPlayersAnswered(answeredPlayerIds);

    // Unified condition to check if all players are either answered or timed out
    if (
      players.length > 0 &&
      answeredPlayerIds.length + timedOutPlayerIds.length === players.length && // all players have either answered or timed out
      timedOutPlayerIds.length > 0 &&// at least one player has timed out
      !showCorrectAnswer &&
      !proceeding
    ) {
      console.log("combo");
     // clearTimedOutPlayers();
      //clearAnswers();
      setShowCorrectAnswer(true);
      setProceeding(true);
      setTimeout(() => proceedToNextQuestion(), 2000); // 2-second delay to show correct answer
    }
  });

  return () => unsubscribeTimedOutPlayers();
}, [gameId, players.length, playersAnswered.length, playersTimedOut.length, showCorrectAnswer, proceeding]);


  // Listen for players joining, even tho in progress shouldn't be able to join
  // its here for now, maybe can be removed later

  // **it is useful to listen for players collection in context of the game and other fuctions**
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

  //listens for answers from the database using snapshot
  // then takes them to compare to the amount of players
  // if they match that means everyone has answered
useEffect(() => {
  if (!gameId) return;
  const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
  const unsubscribeAnswers = onSnapshot(currentAnswersRef, (snapshot) => {
    const answersList = snapshot.docs.map((doc) => doc.data());
    setPlayersAnswered(answersList.map((answer) => answer.playerId));

    // condition to check if all players have answered
    if (players.length > 0 && playersAnswered.length === players.length && !showCorrectAnswer && !proceeding) {
      setShowCorrectAnswer(true);
      //clearAnswers(); // Clear answers collection for the next question
      setProceeding(true);// Prevent multiple timeouts, it has fired multiple times previousl
      console.log("all answ") 
      setTimeout(() => proceedToNextQuestion(), 2000); // 2-second delay to show correct answer
    }
  });
  return () => unsubscribeAnswers();
}, [gameId, players.length, playersAnswered.length, showCorrectAnswer, proceeding]);


// maybe send a boolean to database when your time = 0
// then show correct answer, and then proceed to next question thingy
// perhaps this could work. Remember to clear timer boolean when new question


//handles the next question, clears answers and timed out players
//if answers are run out, finish game call
const proceedToNextQuestion = async () => {
  await clearAnswers(); 
  await clearTimedOutPlayers();
  setProceeding(false);

  if (questionIndex + 1 >= questions.length) {
    setIsQuizCompleted(true); //and here
    completeQuiz(); //here
  } else {
    setQuestionIndex((prevIndex) => prevIndex + 1);
    setTimeLeft(20); // Reset timer for new question
    console.log("proceed");
    setHasAnswered(false);
    setPlayersAnswered([]); // Clear players who answered
    setShowCorrectAnswer(false); // Hide correct answer
  }
};

// this clears currentAnswers from database.
// they are compared to the amount of players connected
// players === currentAnswers, then the correct answer is displayed.
const clearAnswers = async () => {
  const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');
  const snapshot = await getDocs(currentAnswersRef);
  snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
};

const clearTimedOutPlayers = async () => {
  const timedOutPlayersRef = collection(db, 'games', gameId, 'timedOutPlayers');
  const snapshot = await getDocs(timedOutPlayersRef);
  snapshot.forEach(async (doc) => await deleteDoc(doc.ref));
}


//sends choesen answer to the database
//checks if the answer is correct
//if correct, adds a point to the score locally, that is later taken to compare to other players
const submitAnswer = async (selectedAnswer) => {
  if (hasAnswered) return;
  setHasAnswered(true);

  const currentQuestion = questions[questionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer; // is correct
  if (isCorrect) setScore((prevScore) => prevScore + 1); //gz you got a point

  try {
    const currentAnswersRef = collection(db, 'games', gameId, 'currentAnswers');//adds to total amount of players who have answered
    await addDoc(currentAnswersRef, {
      playerId: auth.currentUser.uid,
      answer: selectedAnswer,
      isCorrect,
      submittedAt: new Date(),
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
  }
};


//this is called when the quiz is completed
//it saves the final score to the database
//then calls for fetch best player after 2 seconds
//and then deletes the game after 30 seconds
const completeQuiz = async () => {
  const playerRef = doc(db, 'games', gameId, 'players', auth.currentUser.uid);
  const percentageScore = (score / questions.length) * 100;

  try {
    // Update player's final score in Firestore
    await setDoc(playerRef, {
      uid: auth.currentUser.uid,
      finalScore: score,
      percentageScore,
    }, { merge: true }); //merge useful, no need to make new collection

    // Fetch the best player after saving the score
    setTimeout(fetchBestPlayer, 2000); // Delay before fetching best player
    // Delay before deleting the game
    setTimeout(deleteGame, 30000); // Delete game after 30 seconds
  } catch (error) {
    console.error("Error saving final score:", error);
  }
};


//deletes the game from the database, duh
const deleteGame = async () => {
  if (!gameId) return;
  try {
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef);
  } catch (error) {
    console.error("Error deleting game:", error);
  }
  navigation.navigate('KahootHomeScreen');
};


//delete generated quiz is missing,
// can be later added, code is saved, ask @tumbsi
// condition to check if quizz wants to be saved, because all generated quizzes
// are tagged as false, in saved: column
// if true, then it is saved, if false, then it is deleted after 30 seconds

//only generated quizzes are handled to be deleted.
// this is, because.



//gets players and takes the score and starts to compare them
const fetchBestPlayer = async () => {
  setLoadingBestPlayer(true);
  if (!gameId) return;
  try {
    const playersRef = collection(db, "games", gameId, "players");
    const snapshot = await getDocs(playersRef);
    let bestScore = -1; //initialize
    let bestPlayerData = null; //these

    //loop through all players and compare their scores
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.finalScore !== undefined && data.finalScore > bestScore) {
        bestScore = data.finalScore;
        bestPlayerData = {
          uid: data.uid,
          finalScore: data.finalScore,
          percentageScore: (data.finalScore / questions.length) * 100,
        };
      }
    });

    setBestPlayer(bestPlayerData);
  } catch (error) {
    console.error("Error fetching best player:", error);
  } finally {
    setLoadingBestPlayer(false);
  }
};

  //return has conditions for showing questions, answers, and the correct answer
  //and the end screen and so forth.
  //probably needs to be cleaned up a bit and modified when approaching final version

  //prototype styling exists, but can be modified to fit the final version
  // and is not set in stone....


  //this exitgame is copypaste from KahootGameScreen.js
  //it is used to exit the game, and delete the game from the database
  //if user if not creator, they will exit and be redirected to the home screen
  // their uid listing is deletd from the database, this ensures that the game still plays fine
  // if the creator leaves, the game is deleted from the database
  const exitGame = async() => {
    const playerId = auth.currentUser.uid;
  
    if (playerId) {
      try {
        // First, check if the user is the creator and delete the game if they are
        const gameDocRef = doc(db, 'games', gameId);
        const gameDoc = await getDoc(gameDocRef);
  
        if (gameDoc.exists()) {
          const gameData = gameDoc.data();
          const creatorId = gameData.creatorId;
  
          if (playerId === creatorId) {
            // If the current user is the creator, delete the entire game document
            await deleteDoc(gameDocRef);
            console.log('Game deleted:', gameId);
            navigation.navigate('KahootHomeScreen'); // Redirect after game deletion
            return; 
          }
        } else {
          console.error('Game document not found:', gameId);
          return; // Exit if the game document is missing
        }
      } catch (error) {
        console.error('Error while checking/deleting game document:', error.message || error);
      }
  
      // If the user is not the creator, attempt to delete their player document in the subcollection
      try {
        const playerDocRef = doc(db, 'games', gameId, 'players', playerId); // Referencing with playerId as document ID
        await deleteDoc(playerDocRef);
        console.log(`Player document ${playerId} removed from game ${gameId}`);
        navigation.navigate('KahootHomeScreen'); // Redirect after player removal
      } catch (deleteError) {
        console.error('Error while deleting player document:', deleteError.message || deleteError);
      }
    } else {
      console.error('No player ID found. User may not be authenticated.');
    }
  };


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
              {showCorrectAnswer && (
                <Text>The correct answer was: {questions[questionIndex].correctAnswer}</Text>
              )}
              <Text>Time left: {timeLeft}</Text>
            </>
          )}
        </>
      ) : (
        <View>
          <Text>Quiz Completed!</Text>
          {loadingBestPlayer ? (
            <Text>Loading results...</Text>
          ) : bestPlayer ? (
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
      <Button title="Exit Game" onPress={exitGame} />
    </View>
  );
};

export default QuizzScreen;