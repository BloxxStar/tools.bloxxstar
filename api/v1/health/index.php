<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

try {
    $pdo = db();
    $databaseVersion = (string) $pdo->query('SELECT VERSION()')->fetchColumn();
    $databaseName = (string) $pdo->query('SELECT DATABASE()')->fetchColumn();

    jsonResponse([
        'status' => 'ok',
        'service' => 'BloxxStar API',
        'version' => 'v1',
        'php' => PHP_VERSION,
        'database' => [
            'connected' => true,
            'name' => $databaseName,
            'version' => $databaseVersion,
            'charset' => (string) $pdo->query('SELECT @@character_set_connection')->fetchColumn(),
            'collation' => (string) $pdo->query('SELECT @@collation_connection')->fetchColumn(),
        ],
        'time' => gmdate(DATE_ATOM),
    ]);
} catch (Throwable $exception) {
    $debug = env('APP_DEBUG', 'false') === 'true';

    jsonResponse([
        'status' => 'error',
        'service' => 'BloxxStar API',
        'database' => ['connected' => false],
        'message' => $debug ? $exception->getMessage() : 'Die Datenbankverbindung ist fehlgeschlagen.',
        'time' => gmdate(DATE_ATOM),
    ], 503);
}
