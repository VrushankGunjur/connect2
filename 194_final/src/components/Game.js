import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import { db } from '../firebase.js';
import { useAuthState } from "react-firebase-hooks/auth";
import UserForm from './UserForm.js';
import GameDropDown from './GameDropDown.js';
import ResultsTable from './ResultsTable.js';
import ChatBox from './ChatBox.js'; // Adjust the path as necessary
import "../styles/Game.css";


// state
function diff(trueState, guessState) {
  /*
      Value 1- Difference  (DIRECTIONALITY)
      0 == true value is less than guess
      1 == true value is greater than guess
      2 == true value matches the guess

          OR BLANK (depending on use case)

      Value 2- Color Gradient  (MAGNITUDE) 0=Red, .5 = Yellow, 1 == Green  (approx)
      Age = 1 year is .5
      Height: 3 in is .5 
      Ethnicity: cos sim
      Favorite Color: cos sim
      Gender: 0-Red 1- Green 
      Hometown- cos sim
      Major- cos sim 

  */


  // let diffState = {age: {cur: 2, color: 1}, [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0]};
  let colorCutoffsNum = {
    Age: 1,
    Height: 3
  }
  let colorCutoffsWord = {
    FirstName: 0,
    LastName: 0,
    Gender: 5,
    Ethnicity: 10,
    FavoriteColor: 20,
    FavoriteSport: 20,
    HomeState: 10,
    Major: 10
  }
  let majorVals = {
    "Education":0.010752688172043012,
    "Dance (TAPS Minor)":0.021505376344086023,
    "Comparative Literature":0.03225806451612903,
    "Anthropology":0.043010752688172046,
    "Sociology":0.053763440860215055,
    "Community Health and Prevention Research":0.06451612903225806,
    "English":0.07526881720430108,
    "Art History":0.08602150537634409,
    "Art Practice":0.0967741935483871,
    "Communication":0.10752688172043011,
    "Gender, and Sexuality Studies":0.11827956989247312,
    "Chicana/o - Latina/o Studies":0.12903225806451613,
    "French":0.13978494623655913,
    "Women's Studies":0.15053763440860216,
    "Global Studies":0.16129032258064516,
    "History":0.17204301075268819,
    "Psychology":0.1827956989247312,
    "Theater and Performance Studies":0.1935483870967742,
    "Religious Studies":0.20430107526881722,
    "Philosophy":0.21505376344086022,
    "Linguistics":0.22580645161290322,
    "Spanish":0.23655913978494625,
    "Classics":0.24731182795698925,
    "Comparative Studies in Race and Ethnicity":0.25806451612903225,
    "Environmental Systems Engineering":0.26881720430107525,
    "Political Science":0.27956989247311825,
    "International Relations":0.2903225806451613,
    "American Studies":0.3010752688172043,
    "Film and Media Studies":0.3118279569892473,
    "Digital Humanities":0.3225806451612903,
    "German Studies":0.3333333333333333,
    "Italian":0.34408602150537637,
    "Jewish Studies":0.3548387096774194,
    "Asian American Studies":0.3655913978494624,
    "East Asian Studies":0.3763440860215054,
    "Middle Eastern Language, Literature and Culture":0.3870967741935484,
    "Iranian Studies":0.3978494623655914,
    "Islamic Studies":0.40860215053763443,
    "Korean":0.41935483870967744,
    "Japanese":0.43010752688172044,
    "Latin American Studies":0.44086021505376344,
    "Iberian and Latin American Cultures":0.45161290322580644,
    "International Policy Studies":0.46236559139784944,
    "International Security Studies":0.4731182795698925,
    "Chinese Studies":0.4838709677419355,
    "Russian Studies":0.4946236559139785,
    "Slavic Languages and Literatures":0.5053763440860215,
    "Portuguese":0.5161290322580645,
    "African Studies":0.5268817204301075,
    "African and African American Studies":0.5376344086021505,
    "Urban Studies":0.5483870967741935,
    "Atmospheric / Energy":0.5591397849462365,
    "Earth Systems":0.5698924731182796,
    "Sustainability":0.5806451612903226,
    "Bioengineering":0.5913978494623656,
    "Biology":0.6021505376344086,
    "Biomechanical Engineering":0.6129032258064516,
    "Biomedical Computation":0.6236559139784946,
    "Chemistry":0.6344086021505376,
    "Chemical Engineering":0.6451612903225806,
    "Materials Science and Engineering":0.6559139784946236,
    "Mechanical Engineering":0.6666666666666666,
    "Data Science":0.6774193548387096,
    "Aerospace Engineering":0.6881720430107527,
    "Applied and Engineering Physics":0.6989247311827957,
    "Physics":0.7096774193548387,
    "Computer Science":0.7204301075268817,
    "Electrical Engineering":0.7311827956989247,
    "Management Science and Engineering":0.7419354838709677,
    "Mathematics":0.7526881720430108,
    "Statistics":0.7634408602150538,
    "Engineering Physics":0.7741935483870968,
    "Product Design":0.7849462365591398,
    "Ethics in Society":0.7956989247311828,
    "Democracy, Development, and the Rule of Law":0.8064516129032258,
    "Energy Resources Engineering":0.8172043010752689,
    "Honors in the Arts":0.8279569892473119,
    "Music, Science, and Technology":0.8387096774193549,
    "Philosophy and Religious Studies":0.8494623655913979,
    "Public Policy":0.8602150537634409,
    "Science, Technology, and Society":0.8709677419354839,
    "Translation Studies":0.8817204301075269,
    "Laboratory Animal Science":0.8924731182795699,
    "Medieval Studies":0.9032258064516129,
    "Native American Studies":0.9139784946236559,
    "Symbolic Systems":0.9247311827956989,
    "South Asian Studies":0.9354838709677419,
    "Modern Languages":0.946236559139785,
    "Human Rights":0.956989247311828,
    "Modern Thought and Literature":0.967741935483871,
    "Music":0.978494623655914,
    "Turkish Studies":0.989247311827957,
    "Human Biology":1.0,};
  let resState = {};


  for (const key in trueState) {
    let diff = { dir: 2, color: 1 };
    if (key === "Major") {
      let d = majorVals[trueState[key]] - majorVals[guessState[key]];
      if (d < 0) {d *= (-1);}
      diff.color = 1 - d;
      console.log(trueState[key]);
      console.log(guessState[key]);
      console.log("PPP");
      console.log(diff.color)
    } else if (key == "ProfilePhotoURL") {
      diff.ProfilePhotoURL = trueState.ProfilePhotoURL;
      if (trueState.id === guessState.id) {
        diff.color = 1;
      } else {
        diff.color = 0;
      }
    } else if (key in colorCutoffsWord) {
      if (trueState[key] !== guessState[key]) {
        diff.color = 0;
      }
      else {
        diff.color = 1;
      }
    } else if (key in colorCutoffsNum){
      if (trueState[key] < guessState[key]) {
        diff.dir = 0;
        if (guessState[key] - trueState[key] > colorCutoffsNum[key]) {
          diff.color = 0;
        }
        else {
          diff.color = 0.5;
        }
      }
      else if (trueState[key] > guessState[key]) {
        diff.dir = 1;
        if (trueState[key] - guessState[key] > colorCutoffsNum[key]) {
          diff.color = 0;
        }
        else {
          diff.color = 0.5;
        }
      }
    }

    resState[key] = diff;
  }

  console.log(resState);
  return resState;
}


export function Game() {
  const [randomUser, setRandomUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [guessedUsers, setGuessedUsers] = useState([]);
  const [dispUsers, setDispUsers] = useState([]);
  const [firstLogin, setFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChatBox, setShowChatBox] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);




  let dispFeatures = ["ProfilePhotoURL", "FirstName", "LastName", "Age", "Ethnicity", "FavoriteColor", "FavoriteSport", "Gender", "Height", "HomeState", "Major"];

  // Your existing handler functions remain unchanged

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid); // Use 'uid' instead of 'id'
      } else {
        // User is signed out
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);
  

  useEffect(() => {
    // This ensures fetchUsers only runs after currentUserId is set (i.e., not null)
    if (currentUserId === null) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        const currUserData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fullName: `${doc.data().FirstName} ${doc.data().LastName}`, // Concatenate for display
          formattedHeight: formatHeight(doc.data().Height), // Convert Height to feet and inches
        }))
        .filter(user => user.id === currentUserId);

        console.log(currUserData)
        
        const currUserGroup = currUserData[0].Group;
        console.log("curr group is " + currUserGroup)


        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fullName: `${doc.data().FirstName} ${doc.data().LastName}`, // Concatenate for display
          formattedHeight: formatHeight(doc.data().Height), // Convert Height to feet and inches
        }))
        .filter(user => user.NewUser === false && user.id !== currentUserId && user.Group === currUserGroup);

        
  
        console.log("current user id is " + currentUserId);
        console.log(usersData);
        setUsers(usersData);
        if (usersData.length > 0) {
          const randomIndex = Math.floor(Math.random() * usersData.length);
          setRandomUser(usersData[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setFeedback('Failed to load users.');
      }
    };

    fetchUsers();
  }, [currentUserId]); // Re-run when currentUserId changes


  // Helper function to convert height from inches to feet and inches format
  const formatHeight = (inches) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`; // Format as X'Y"
  };

  const handleGuessChange = (selectedOption) => {
    setSelectedUserId(selectedOption ? selectedOption.value : '');
  };

  const handleGuessSubmit = (event) => {
    event.preventDefault();

    // call diff on guessedUser and randomUser
    // call AttributeRectangles on output of diff
    // return the output of AttributeRectangles in the HTML component

    const guessedUser = users.find(user => user.id === selectedUserId);
    if (guessedUser) {
      if (randomUser && selectedUserId === randomUser.id) {
        setFeedback('Correct! You guessed the right user.');
        setShowChatBox(true);
      } else {
        setUsers(users.filter(user => user.id !== selectedUserId));
        setFeedback('Incorrect guess. Try again!');
      }
      // Add the guessed user with all formatted traits to the guessedUsers array

      setGuessedUsers([...guessedUsers, guessedUser]);
      let resDiffs = diff(guessedUser, randomUser);
      let dispUser = {};
      for (const key of dispFeatures) {
        dispUser[key] = {};
        dispUser[key].data = guessedUser[key];
        if (key === "Height") { dispUser[key].data = formatHeight(guessedUser[key]); }
        dispUser[key].disp = resDiffs[key];
      }
      setDispUsers([...dispUsers, dispUser]);
    }
    setSelectedUserId(''); // Reset for next guess
  };
  return (
    <div className="gameContainer">
      
      {randomUser && users.length > 0 && !showChatBox && (
        <>
          <h2 className="header">Guess the User's Name</h2>
          <p className="description">Can you guess the name of the user?</p>
          <form onSubmit={handleGuessSubmit} className="formStyle">
            <GameDropDown users={users} onChange={handleGuessChange} value={selectedUserId} />
            <button type="submit" className="guessButton">Guess</button>
          </form>
          {feedback && <p className="feedback">{feedback}</p>}
        </>
      )}
      {guessedUsers.length > 0 && (
        <>
          {showChatBox && <h2 className="header">{feedback}</h2>}
          <h3 className="subheader">Guessed Users:</h3>
          <ResultsTable users={guessedUsers} correctGuessId={randomUser.id} dispUsers={dispUsers} />
          {showChatBox && <ChatBox userId={currentUserId} otherUserId={randomUser.id} />}
        </>
      )}
    </div>
  );
}

export default Game;