"use client";

export default function PrivacyControls() {
  const reviewChoice = () => {
    localStorage.removeItem("tcp:analytics-consent");
    try { sessionStorage.removeItem("tcp:analytics-session"); sessionStorage.removeItem("tcp:attribution"); } catch {}
    window.location.reload();
  };
  return <button className="privacyChoiceButton" type="button" onClick={reviewChoice}>Review analytics choice</button>;
}
