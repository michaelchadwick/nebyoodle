<?php

$HASH_ALGO = 'crc32';
$DATE_FORMAT = 'l jS \of F Y';
$DATE_FORMAT_LOG = 'Y-m-d';
$SERVER_VALID_SONGIDS_FILE = '../text/validSongIds.txt';
$tz = (new DateTimeZone('America/Los_Angeles'));
$env = isset($_REQUEST['env']) ? $_REQUEST['env'] : 'local';

$epochDateTime = new DateTime('2023-04-14', $tz);
$serverDateTime = new DateTime('now', $tz);

// daily puzzle index == days since epoch (int)
$index = intval($epochDateTime->diff($serverDateTime)->format('%a'));

$seeds = null;

// if no local cache of valid songids exists
// do a jsonapi call to grab them and save them
if (!file_exists($SERVER_VALID_SONGIDS_FILE)) {
  $ch = curl_init();

  $url = 'https://music.nebyoolae.com';
  $url .= '/jsonapi/views/songs/songs_neb_ids';

  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

  $songIds = curl_exec($ch);

  curl_close($ch);

  $temp = json_decode($songIds, true);

  function getId($song) {
    return $song['drupal_internal__nid'];
  }
  $seeds = array_map('getId', $temp['data']);

  $fp = fopen($SERVER_VALID_SONGIDS_FILE, 'w');
  fwrite($fp, implode("\n", $seeds));
  fclose($fp);
} else {
  $fp = fopen($SERVER_VALID_SONGIDS_FILE, 'r');
  $seeds = explode("\n", fread($fp, filesize($SERVER_VALID_SONGIDS_FILE)));
  fclose($fp);
}

$seedsCount = count($seeds);

// get unique date string for today (int-> string)
$today = $serverDateTime->format($DATE_FORMAT);
$todayLog = $serverDateTime->format($DATE_FORMAT_LOG);

// get integer hash for today (hex)
$hashHex = hash($HASH_ALGO, strval($today));
$hashInt = intval(base_convert($hashHex, 16, 10));

// get bounded seeds index from today's hash
$seedsIndex = intval($hashInt) % $seedsCount;

// get today's songId
$todaySongId = $seeds[$seedsIndex];

// get song data from remote API via songId
$ch = curl_init();

$url = 'https://music.nebyoolae.com';
$url .= '/jsonapi/views/random_song/guess_neb_single';
$url .= '?views-argument[0]=' . $todaySongId . '&include=field_album_id,field_album_id.field_album_cover,field_artist_id';

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$song = curl_exec($ch);

curl_close($ch);

if ($song) {
  echo json_encode(array(
    'index' => $index,
    'message' => 'Got daily song and index',
    'songId' => $todaySongId,
    'status' => 'ok'
  ));
} else {
  echo json_encode(array(
    'message' => 'Could not get daily song',
    'status' => 'error',
    'url' => $url
  ));
}

?>
