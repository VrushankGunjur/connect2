import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import GoogleSignin from "../img/btn_google_signin_dark_pressed_web.png";
import connect2 from "../img/connect2.png";
import "../styles/NavBar.css";
import infoIcon from "../img/info_icon.png";
import { useNavigate } from 'react-router-dom';



const NavBar = ({ currUserGroup, setCurrUserGroup, isNewUser, updateProfileTrue, updateProfileFalse, fetchGroupsTrigger }) => {
  const [user] = useAuthState(auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const openCreateGroupPage = () => {
    navigate('/create-group'); 
  };

  const updateGroup = (newGroup) => {
    console.log("trying to update group to:", newGroup);
    updateProfileFalse();
    setCurrUserGroup(newGroup);
    navigate('/'); 
  };

  const updateProfile = () => {
    updateProfileTrue();
    navigate('/profile'); 
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userGroupsCodes = userDocSnap.data().Group;
        const groupsFetchPromises = userGroupsCodes.map(groupCode => getDoc(doc(db, "groups", groupCode)));

        const groupsDocsSnap = await Promise.all(groupsFetchPromises);
        const groupsData = groupsDocsSnap.map(docSnap => ({
          code: docSnap.id,
          ...docSnap.data()
        }));

        setUserGroups(groupsData);
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching user groups:", error);
    }
  };


  useEffect(() => {
    if (currentUserId === null || isNewUser) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));

        const currUserData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id === currentUserId);

        if (currUserData.length > 0 && !isNewUser) {
          console.log("Current user's group:", currUserGroup);
          setUserGroups((prevGroups) => [...prevGroups, currUserGroup]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUserId, isNewUser, fetchGroupsTrigger]);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .catch((error) => console.error("Error signing in with Google:", error))
      .finally(() => navigate('/game')); 
  };

  const handleSignOut = () => {
    signOut(auth)
      .catch((error) => console.error("Error signing out:", error))
      .finally(() => navigate('/'));
  };

  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => setShowPopup(!showPopup);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const openAddGroupPage = () => {
    navigate('/add-group'); 
  };

  const imageClick = () => {
    updateProfileFalse();
    navigate('/'); 
  }

  useEffect(() => {
    fetchUserGroups();
  }, [user]);
  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <button onClick={togglePopup} className="info-btn">
          <img src={infoIcon} alt="Info Icon" className="info-icon" />
        </button>
      </div>
      <div className="logo-and-title">
        <img src={connect2} onClick={() => imageClick()} alt="Connect2 Logo" className="logo" />
        <h1>Connect2</h1>
      </div>
      <div className="nav-right">
        
      {showPopup && (
        <div className="fullscreen-popup">
          <div className="popup-content">
            <h1>Welcome to Connect2!</h1>
            <p>🎉 Connect2 is designed to help you connect and learn more about others!</p>
            <ul>
              <li>Each day, you'll be matched with another user from your group.</li>
              <li><strong>Your mission:</strong> Guess your match within your allotted guesses.</li>
            </ul>
            <h2>Guessing Game Rules</h2>
            <ul>
              <li>Each guess will be a person in your current group</li>
              <li>After each guess, see how your guess compares to your match.</li>
              <li>🔍 <strong>Arrows</strong> indicate the direction your match is compared to your guess.</li>
              <li><strong>Colors</strong> beyond red and green show how close your match is to your guess.</li>
            </ul>
            <p>Out of guesses? You won't get your match's responses, but you will get to chat!</p>
            <button onClick={togglePopup}>GO!</button>
          </div>
        </div>
      )}
      {user ? (
        <div className="nav-right">
          {userGroups && (
          <div className="user-groups">
            <button onClick={toggleDropdown} className="user-groups-btn">
              User Groups
            </button>
              <div className="dropdown-content">
                {userGroups.length > 0 ? (
                  userGroups.map((group) => (
                    <div key={group.code} className="dropdown-item" onClick={() => updateGroup(group.code)}>
                      {group.name} 
                      <img
                        src={infoIcon}
                        alt="Info"
                        className="info-icon-groups"
                        onClick={(e) => {
                          e.stopPropagation(); // This stops the click event from propagating to the parent div
                          navigate(`/group-info/${group.code}`);
                        }}
                      />
                    </div>

                  ))
                ) : (
                  <div className="dropdown-item">No groups found</div>
                )}
                <div className="dropdown-item" onClick={openAddGroupPage}>+ Join Group</div>
                <div className="dropdown-item" onClick={openCreateGroupPage}>+ Create Group</div>
              </div>
          </div>
          )}
          {!user.NewUser && (
          <button onClick={updateProfile} className="user-groups-btn" type="button">
            Update Profile
          </button>
          )}
          <button onClick={handleSignOut} className="sign-out" type="button">
            Sign Out
          </button>
        </div>
      ) : (
        <button className="sign-in" type="button" onClick={googleSignIn}>
          <img src={GoogleSignin} alt="Sign in with Google" />
        </button>
      )}
      </div>
    </nav>
  );
};

export default NavBar;
