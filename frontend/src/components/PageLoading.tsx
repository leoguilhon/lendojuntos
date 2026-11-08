interface PageLoadingProps {
  message: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  return (
    <main className="shell" id="conteudo-principal" aria-busy="true">
      <p role="status" aria-live="polite">{message}</p>
    </main>
  );
}
