// src/components/SuccessAnimation.jsx
import React from "react";
import Lottie from "lottie-react";
import successAnim from "../lottie/food.json"; // path ke file JSON kamu

const SuccessAnimation = () => {
  return (
    <div style={{ width: 200, height: 200, margin: "auto" }}>
      <Lottie animationData={successAnim} loop={false} autoplay={true} />
      <p style={{ textAlign: "center", fontWeight: "bold" }}>Berhasil!</p>
    </div>
  );
};

export default food;
