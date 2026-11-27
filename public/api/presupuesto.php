<?php
/**
 * Formulario de presupuesto de creativerent.es (hosting Webempresa).
 * Recibe JSON desde ContactForm.astro, valida y envía un email a info@creativerent.es.
 * Antispam: campo trampa "web", tiempo mínimo de rellenado y máximo 5 envíos por IP y hora.
 * No guarda ningún dato.
 */
declare(strict_types=1);

const QUOTE_TO   = 'info@creativerent.es';
const QUOTE_FROM = 'info@creativerent.es';
const TIPOS      = ['institucional', 'corporativo', 'congreso', 'fiesta-popular', 'otro'];
const MAX_PER_HOUR = 5;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function line(mixed $v, int $max): string {
    $s = is_string($v) ? $v : (is_int($v) || is_float($v) ? (string) $v : '');
    $s = trim(preg_replace('/[\r\n\t\x00-\x1F\x7F]+/u', ' ', $s) ?? '');
    return mb_substr($s, 0, $max + 1);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false]);
}

$in = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($in)) respond(400, ['ok' => false, 'errors' => ['_' => 'invalid_json']]);

// Campo trampa: los humanos no lo ven; si viene relleno, fingimos éxito sin enviar nada.
if (line($in['web'] ?? '', 200) !== '') respond(200, ['ok' => true]);

// Tiempo mínimo entre la carga del formulario y el envío.
$minSeconds = (int) (getenv('QUOTE_MIN_SECONDS') !== false ? getenv('QUOTE_MIN_SECONDS') : 3);
$t = (int) ($in['t'] ?? 0);
if ($minSeconds > 0 && ($t <= 0 || (time() * 1000 - $t) < $minSeconds * 1000)) respond(200, ['ok' => true]);

$d = [
    'nombre'       => line($in['nombre'] ?? '', 120),
    'organizacion' => line($in['organizacion'] ?? '', 160),
    'email'        => is_string($in['email'] ?? null) ? trim($in['email']) : '',
    'telefono'     => line($in['telefono'] ?? '', 40),
    'tipoEvento'   => line($in['tipoEvento'] ?? '', 40),
    'fecha'        => line($in['fecha'] ?? '', 10),
    'lugar'        => line($in['lugar'] ?? '', 160),
    'asistentes'   => line($in['asistentes'] ?? '', 7),
    'mensaje'      => is_string($in['mensaje'] ?? null) ? trim(str_replace("\r\n", "\n", $in['mensaje'])) : '',
];

$e = [];
if ($d['nombre'] === '' || mb_strlen($d['nombre']) > 120) $e['nombre'] = 'required';
if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($d['email']) > 160) $e['email'] = 'invalid';
if (!in_array($d['tipoEvento'], TIPOS, true)) $e['tipoEvento'] = 'invalid';
if ($d['mensaje'] === '') $e['mensaje'] = 'required';
elseif (mb_strlen($d['mensaje']) > 5000) $e['mensaje'] = 'too_long';
if (($in['privacidad'] ?? false) !== true) $e['privacidad'] = 'required';
if (mb_strlen($d['organizacion']) > 160) $e['organizacion'] = 'too_long';
if (mb_strlen($d['telefono']) > 40) $e['telefono'] = 'too_long';
if (mb_strlen($d['lugar']) > 160) $e['lugar'] = 'too_long';
if ($d['fecha'] !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $d['fecha'])) $e['fecha'] = 'invalid';
if ($d['asistentes'] !== '' && !preg_match('/^\d{1,7}$/', $d['asistentes'])) $e['asistentes'] = 'invalid';
if ($e) respond(400, ['ok' => false, 'errors' => $e]);

// Límite de envíos por IP (archivo en el directorio temporal del servidor).
$rateDir = getenv('QUOTE_RATE_DIR') ?: sys_get_temp_dir();
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = rtrim($rateDir, '/') . '/rate-' . hash('sha256', $ip . 'creativerent');
$now = time();
$hits = array_filter(
    is_file($rateFile) ? (array) json_decode((string) file_get_contents($rateFile), true) : [],
    fn($ts) => is_int($ts) && $ts > $now - 3600
);
if (count($hits) >= MAX_PER_HOUR) respond(429, ['ok' => false, 'errors' => ['_' => 'rate_limited']]);
$hits[] = $now;
@file_put_contents($rateFile, json_encode(array_values($hits)), LOCK_EX);

$labels = [
    'Nombre' => $d['nombre'], 'Organización' => $d['organizacion'], 'Email' => $d['email'],
    'Teléfono' => $d['telefono'], 'Tipo de acto' => $d['tipoEvento'], 'Fecha' => $d['fecha'],
    'Lugar' => $d['lugar'], 'Asistentes' => $d['asistentes'],
];
$body = '';
foreach ($labels as $k => $v) if ($v !== '') $body .= "$k: $v\n";
$body .= "\n" . $d['mensaje'] . "\n";

$subjectText = 'Solicitud de presupuesto: ' . $d['nombre'] . ($d['organizacion'] !== '' ? ' (' . $d['organizacion'] . ')' : '');
$subject = mb_encode_mimeheader($subjectText, 'UTF-8', 'B', "\r\n");
$headers = [
    'From' => 'Web Creative Rent <' . QUOTE_FROM . '>',
    'Reply-To' => $d['email'],
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
];

$mailFile = getenv('QUOTE_MAIL_FILE');
if ($mailFile) {
    // Modo pruebas: escribe el email en un archivo en lugar de enviarlo.
    $raw = 'To: ' . QUOTE_TO . "\nSubject: $subjectText\n";
    foreach ($headers as $k => $v) $raw .= "$k: $v\n";
    file_put_contents($mailFile, $raw . "\n" . $body);
    respond(200, ['ok' => true]);
}

$sent = mail(QUOTE_TO, $subject, $body, $headers, '-f' . QUOTE_FROM);
if (!$sent) respond(502, ['ok' => false, 'errors' => ['_' => 'send_failed']]);
respond(200, ['ok' => true]);
