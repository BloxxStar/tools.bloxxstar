<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $database = env('DB_NAME');
    $user = env('DB_USER');
    $password = env('DB_PASSWORD');
    $charset = env('DB_CHARSET', 'utf8mb4') ?? 'utf8mb4';
    $socket = env('DB_SOCKET');

    if (!$database || !$user || $password === null) {
        throw new RuntimeException('Die Datenbankkonfiguration ist unvollständig.');
    }

    $dsn = $socket
        ? sprintf('mysql:unix_socket=%s;dbname=%s;charset=%s', $socket, $database, $charset)
        : sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            env('DB_HOST', 'localhost'),
            env('DB_PORT', '3306'),
            $database,
            $charset
        );

    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_STRINGIFY_FETCHES => false,
    ]);

    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("SET time_zone = '+00:00'");

    return $pdo;
}
