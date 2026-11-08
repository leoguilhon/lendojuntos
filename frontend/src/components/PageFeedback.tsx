interface PageFeedbackProps {
  message: string;
}

export function PageFeedback({ message }: PageFeedbackProps) {
  if (!message) return null;
  const isError = message.startsWith("Erro:");

  return (
    <p className={`feedback page-feedback${isError ? " error" : ""}`} role={isError ? "alert" : "status"}>
      {message}
    </p>
  );
}
