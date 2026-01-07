<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Ensure the public path matches the directory this index.php lives in.
// This makes deployments where the public directory is relocated (e.g. cPanel public_html)
// work without needing additional framework configuration.
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
