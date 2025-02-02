import React, { useEffect, useState } from "react";
import "../styles/ResultsTable.css"; 

function sleep(s) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * s));
}

const defaultBackgroundColor = "gray";
const animationTimeSeconds = 0.25;

const Tile = ({ backgroundColor, text, duration, delayTime, flip }) => {
    if (!flip) {duration = 0; delayTime = 0;}
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        const applyFlip = async () => {
        await sleep(delayTime);
        setFlipped(true);
        };

        applyFlip();
    }, [delayTime]);

    return (
        <td
          className={`tile ${flipped ? 'flipped' : ''}`}
          style={{
            transition: `transform ${duration}s ease`,
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            backgroundColor: flipped ? backgroundColor : defaultBackgroundColor,
          }}
        >
          <div className="black-box">
            <div
              style={{
                width: '100%',
                height: '100%',
                textAlign: 'center',
                color: 'black',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {flipped && <span className="text">{text}</span>}
            </div>
          </div>
        </td>
      );
};


const ResultsTable = ({ dispUsers }) => {
  const defaultURL =
    "https://firebasestorage.googleapis.com/v0/b/cs194-e95a9.appspot.com/o/profilePictures%2Flogo.png?alt=media&token=8dd2a541-8857-4ea2-a6b8-66d53fd8caea";

  // Function to determine the arrow based on the directionality value
  const getArrow = (value) => {
    switch (value) {
      case 0:
        return "↑";
      case 1:
        return "↓";
      case 2:
        return ""; // No arrow, default
      case 3:
        return "✓"; // match
      default:
        return ""; // Fallback, should not happen
    }
  };

  // Function to normalize the color value for background color
  const getBackgroundColor = (value) => {
    // value from 0 to 1, 0 is red, 1 is green. Return RGB of gradient.
    // linearly scale the red and green values.
    let r = Math.min(255 * (1 - value) + 125, 255);
    let g = Math.min(255 * value + 125, 255);
    if (value > 0 && value < 1) r = 200;
    return `rgb(${r}, ${g}, 125)`;
  };

  // Function to convert inches to feet and inches, if necessary
  function formatHeight(inches) {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  }

  // This function can be expanded to format other traits if necessary
  const formatTrait = (key, value) => {
    if (key === "Height") {
      // Assuming formatHeight is a function you have defined to format height
      if (typeof value == "number") {
        return formatHeight(value);
      } else {
        return value;
      }
    } else if (key === "HomeState") {
        return value.split(",")[0] + ', ' + value.split(",")[1];
    }else if (key === "ProfilePhotoURL") {
      return (
        <img
          src={value ? value : defaultURL}
          alt="Profile"
          style={{ width: "50px", height: "50px", borderRadius: "50%" }}
        />
      );
    }
    return value;
  };

  console.log(dispUsers);
  useEffect(() => {
    // Scroll to the bottom of the page after each guess
    window.scrollTo({ top: document.body.scrollHeight + 100, behavior: 'smooth' });
  }, [dispUsers]);

  return (
    <table className="resultsTable">
      <thead>
        <tr>
          <th>Photo</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Age</th>
          <th>Ethnicity</th>
          <th>Favorite Color + (R,G,B) hints</th>
          <th>Favorite Sport</th>
          <th>Gender</th>
          <th>Height</th>
          <th>Hometown</th>
          <th>Major</th>
          <th>Hot Take</th>
        </tr>
      </thead>
      <tbody>
        {dispUsers.map((user, index) => (
          <tr key={index}>
            {Object.keys(user).map((key, keyIndex) => {
              let backgroundColor = "gray";
              let print_value = "";
              if (key === "ProfilePhotoURL") {
                backgroundColor = getBackgroundColor(user[key].disp.color);
                print_value = formatTrait(key, user[key].data);
              } else if (key === "FavoriteColor") {
                const traitValue = formatTrait(key, user[key].data);
                const r_arrow = getArrow(user[key].disp.r);
                const g_arrow = getArrow(user[key].disp.g);
                const b_arrow = getArrow(user[key].disp.b);
                backgroundColor = getBackgroundColor(user[key].disp.color);
                print_value =
                  traitValue + " " + r_arrow + " " + g_arrow + " " + b_arrow;
              } else if (key === "HomeState") {
                const traitValue = formatTrait(key, user[key].data);
                backgroundColor = getBackgroundColor(user[key].disp.color);
                print_value = traitValue + ", " + user[key].disp.dist + "mi " + user[key].disp.compassDir;
              } else if (key !== "id") {
                const traitValue = formatTrait(key, user[key].data);
                const arrow = getArrow(user[key].disp.dir);
                backgroundColor = getBackgroundColor(user[key].disp.color);
                print_value = traitValue + " " + arrow;
              } else {
                return null;
              }
              return (
                <Tile
                  backgroundColor={backgroundColor}
                  text={print_value}
                  duration={animationTimeSeconds}
                  delayTime={keyIndex * animationTimeSeconds}
                  flip={index === dispUsers.length - 1}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultsTable;
