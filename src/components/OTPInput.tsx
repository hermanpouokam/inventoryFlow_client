// import React, { useRef, useState, useEffect } from "react";

// interface OTPInputProps {
//   length?: number;
//   onComplete: (otp: string) => void;
// }

// const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete }) => {
//   const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
//   const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

//   // Focus la première case vide au montage
//   useEffect(() => {
//     focusFirstEmpty();
//   }, []);

//   const focusFirstEmpty = () => {
//     const firstEmpty = otp.findIndex((val) => val === "");
//     if (firstEmpty !== -1) {
//       inputsRef.current[firstEmpty]?.focus();
//     }
//   };

//   const handleChange = (value: string, index: number) => {
//     if (!/^\d$/.test(value)) return;

//     // N'autorise pas de remplir si case précédente vide (sauf index 0)
//     if (index > 0 && otp[index - 1] === "") {
//       // Refocus la case précédente
//       inputsRef.current[index - 1]?.focus();
//       return;
//     }

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Focus case suivante si existe
//     if (index < length - 1) {
//       inputsRef.current[index + 1]?.focus();
//     }

//     // Si toutes remplies, on appelle onComplete
//     if (newOtp.every((val) => val !== "")) {
//       onComplete(newOtp.join(""));
//     }
//   };

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     const key = e.key;

//     if (key === "Backspace") {
//       e.preventDefault();

//       const newOtp = [...otp];

//       if (newOtp[index] !== "") {
//         // Efface la case courante
//         newOtp[index] = "";
//         setOtp(newOtp);
//         inputsRef.current[index]?.focus();
//       } else if (index > 0) {
//         // Case vide : efface la précédente et focus dessus
//         newOtp[index - 1] = "";
//         setOtp(newOtp);
//         inputsRef.current[index - 1]?.focus();
//       }
//     } else if (key === "ArrowLeft" && index > 0) {
//       e.preventDefault();
//       inputsRef.current[index - 1]?.focus();
//     } else if (key === "ArrowRight" && index < length - 1) {
//       e.preventDefault();
//       inputsRef.current[index + 1]?.focus();
//     }
//   };

//   const handleFocus = (index: number) => {
//     // Empêche le focus si case précédente vide (sauf la première case)
//     if (index > 0 && otp[index - 1] === "") {
//       inputsRef.current[index - 1]?.focus();
//     }
//   };

//   return (
//     <div style={{ display: "flex", gap: 8 }}>
//       {otp.map((digit, index) => (
//         <input
//           key={index}
//           type="text"
//           inputMode="numeric"
//           maxLength={1}
//           value={digit}
//           ref={(el) => (inputsRef.current[index] = el)}
//           onChange={(e) => handleChange(e.target.value, index)}
//           onKeyDown={(e) => handleKeyDown(e, index)}
//           onFocus={() => handleFocus(index)}
//           style={{
//             width: 40,
//             height: 40,
//             textAlign: "center",
//             fontSize: 20,
//             borderRadius: 6,
//             border: "1px solid #ccc",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// export default OTPInput;

import React, { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   inputRef.current?.focus();
  // }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/\D/g, "").slice(0, length);
    const valArr = val.split("");
    const newOtp = Array(length).fill("");
    for (let i = 0; i < valArr.length; i++) {
      newOtp[i] = valArr[i];
    }
    setOtp(newOtp);

    if (valArr.length === length) {
      onComplete(valArr.join(""));
    }
  };

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      let lastFilledIndex = newOtp.length - 1;
      while (lastFilledIndex >= 0 && newOtp[lastFilledIndex] === "") {
        lastFilledIndex--;
      }
      if (lastFilledIndex >= 0) {
        newOtp[lastFilledIndex] = "";
        setOtp(newOtp);
      }
    }
  };

  return (
    <div
      onClick={handleFocus}
      className="otp-container"
      role="group"
      aria-label="Entrer le code de vérification"
    >
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        ref={inputRef}
        value={otp.join("")}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="otp-hidden-input"
      />

      {otp.map((digit, i) => (
        <div key={i} className={`otp-box ${digit ? "filled" : ""}`}>
          {digit}
        </div>
      ))}
    </div>
  );
};

export default OTPInput;
