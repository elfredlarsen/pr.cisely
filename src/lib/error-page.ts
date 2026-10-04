export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <title>Noget gik galt · pr:cisely</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 Poppins, system-ui, -apple-system, sans-serif; background: #fafafa; color: #1a1a1a; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #666666; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.75rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #9333ea; color: #fff; }
      .secondary { background: #fff; color: #1a1a1a; border-color: #e6e6ea; }
      .card { background: #fff; border: 1px solid #e6e6ea; border-radius: 1rem; }
      @media (prefers-color-scheme: dark) {
        body { background: #0f0f12; color: #ededf0; }
        p { color: #a1a1aa; }
        .card { background: #18181c; border-color: #2e2e35; }
        .primary { background: #a855f7; }
        .secondary { background: #18181c; color: #ededf0; border-color: #2e2e35; }
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Noget gik galt</h1>
      <p>Siden kunne ikke indlæses. Prøv igen, eller gå til forsiden.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Prøv igen</button>
        <a class="secondary" href="/">Til forsiden</a>
      </div>
    </div>
  </body>
</html>`;
}
