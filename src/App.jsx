import { useRef, useState } from "react";
import "./App.css";

const foods = [
  {
    name: "サラダ",
    emoji: "🥗",
    video: "/movies/movie_eat_salad.mp4",
  },
  {
    name: "ステーキ",
    emoji: "🥩",
    video: "/movies/movie_eat_steak.mp4",
  },
  {
    name: "パンケーキ",
    emoji: "🥞",
    video: "/movies/movie_eat_desert.mp4",
  },
  {
    name: "桜羽エマ",
    emoji: "💀",
    video: "/movies/movie_eat_ema.mp4",
  },
];

export default function App() {
  const [started, setStarted] = useState(false);

  const [currentVideo, setCurrentVideo] =
    useState(null);

  const [videoReady, setVideoReady] =
    useState(false);

  const [activeFood, setActiveFood] =
    useState(null);

  const [clearedFoods, setClearedFoods] =
    useState([]);

  const [isEnding, setIsEnding] =
    useState(false);

  const [secretUnlocked, setSecretUnlocked] =
    useState(false);

  const [isEmaMode, setIsEmaMode] =
    useState(false);

  const bgmRef = useRef(null);

  const videoRef = useRef(null);

  const startGame = async () => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(
        "/sounds/BGM_loop.mp3"
      );

      bgmRef.current.loop = true;

      bgmRef.current.volume = 0.5;
    }

    try {
      await bgmRef.current.play();
    } catch (e) {
      console.log("BGM再生失敗", e);
    }

    setStarted(true);
  };

  const feedFood = (food, index) => {
    const isLocked =
      index === 3 && !secretUnlocked;

    if (
      isLocked ||
      !food.video ||
      currentVideo ||
      isEnding
    )
      return;

    if (index < 3) {
      setClearedFoods((prev) => {
        if (prev.includes(food.name))
          return prev;

        return [...prev, food.name];
      });
    }

    if (food.name === "桜羽エマ") {
      setIsEmaMode(true);

      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    }

    setVideoReady(false);

    setActiveFood(food.name);

    setCurrentVideo(food.video);
  };

  const handleVideoLoaded = () => {
    if (!videoRef.current) return;

    setVideoReady(true);

    videoRef.current.currentTime = 0;

    const delay =
      activeFood === "桜羽エマ"
        ? 200
        : 0;

    setTimeout(() => {
      if (!videoRef.current) return;

      videoRef.current.play().catch((e) => {
        console.log("動画再生失敗", e);
      });
    }, delay);
  };

  const handleVideoEnded = () => {
    if (
      clearedFoods.length >= 3 &&
      !secretUnlocked &&
      activeFood !== "桜羽エマ"
    ) {
      setSecretUnlocked(true);
    }

    if (activeFood === "桜羽エマ") {
      setIsEnding(true);

      if (videoRef.current) {
        videoRef.current.pause();
      }

      return;
    }

    setVideoReady(false);

    setCurrentVideo(null);

    setActiveFood(null);

    if (bgmRef.current) {
      const isMobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        bgmRef.current.currentTime = 0;
      }

      bgmRef.current.play().catch((e) => {
        console.log("BGM再開失敗", e);
      });
    }
  };

  return (
    <>
      <div className="app">
        <h1 className="title">
          <span>桜羽エマ</span>

          {isEmaMode
            ? "で手料理を作ろう！"
            : "に手料理を作ろう！"}
        </h1>

        <div className="game-screen">
          <img
            src="/images/normal.png"
            alt="桜羽エマ"
            className={`main-image normal-image ${
              videoReady ? "hidden" : ""
            }`}
          />

          {currentVideo && (
            <video
              ref={videoRef}
              src={currentVideo}
              className={`main-image eat-video ${
                videoReady ? "show" : ""
              }`}
              playsInline
              preload="auto"
              onLoadedData={
                handleVideoLoaded
              }
              onEnded={handleVideoEnded}
            />
          )}
        </div>

        <div className="foods">
          {foods.map((food, index) => {
            const isSecret =
              index === 3;

            const isLocked =
              isSecret &&
              !secretUnlocked;

            const displayName =
              isLocked
                ? "？？？"
                : food.name;

            const displayEmoji =
              isLocked
                ? "❔"
                : food.emoji;

            return (
              <button
                key={food.name}
                className={`food-button ${
                  isLocked
                    ? "disabled"
                    : ""
                } ${
                  activeFood ===
                  food.name
                    ? "active-food"
                    : ""
                } ${
                  (
                    currentVideo ||
                    isEnding
                  ) &&
                  activeFood !==
                    food.name
                    ? "inactive-food"
                    : ""
                }`}
                onClick={() =>
                  feedFood(food, index)
                }
                disabled={
                  !started ||
                  isLocked ||
                  currentVideo ||
                  isEnding
                }
              >
                <span className="food-emoji">
                  {displayEmoji}
                </span>

                <span>{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!started && (
        <div className="start-overlay">
          <div className="overlay-bg" />

          <button
            className="start-button"
            onClick={startGame}
          >
            GAME START
          </button>
        </div>
      )}
    </>
  );
}