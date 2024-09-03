<?php
require '../../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = dotenv::createImmutable(__DIR__);
$dotenv->load();

$key = $_GET['debugKey'];
$lock = $_ENV['NEBYOODLE_DEBUG_KEY'];

if (isset($key) && isset($lock)) {
  if ($lock == $key) {
    echo json_encode(true);
  } else {
    echo json_encode(false);
  }
} else {
  echo json_encode(false);
}
