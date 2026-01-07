<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <title>{{ config('app.name', 'Cohort Enrollment Platform') }}</title>

    @php
      $manifestPath = public_path('app/manifest.json');
      $fallbackManifestPath = public_path('app/.vite/manifest.json');
      $resolvedManifestPath = file_exists($manifestPath) ? $manifestPath : (file_exists($fallbackManifestPath) ? $fallbackManifestPath : null);
      $manifest = $resolvedManifestPath ? json_decode(file_get_contents($resolvedManifestPath), true) : null;
      $entry = $manifest['index.html'] ?? null;
    @endphp

    @if ($entry && !empty($entry['css']))
      @foreach ($entry['css'] as $css)
        <link rel="stylesheet" href="/app/{{ $css }}?v={{ time() }}" />
      @endforeach
    @endif
  </head>
  <body>
    <div id="root"></div>

    @if ($entry && !empty($entry['file']))
      <script type="module" src="/app/{{ $entry['file'] }}?v={{ time() }}"></script>
    @else
      <pre style="padding:12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
Frontend build not found.

Run from repo root:
  npm run build

Then start Laravel:
  php artisan serve --host=127.0.0.1 --port=8000
      </pre>
    @endif
  </body>
</html>
