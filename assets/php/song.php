<?php

$env = isset($_REQUEST['env']) ? $_REQUEST['env'] : 'local';
$ch = curl_init();

$songId = isset($_REQUEST['songId']) ? $_REQUEST['songId'] : '';

// https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/api-overview
// $url = $env == 'prod' ? 'https://music.nebyoolae.com' : 'https://muzcom-web.ddev.site';
$url = 'https://music.nebyoolae.com';

// loading existing solution
if (!empty($songId)) {
  $url .= '/jsonapi/views/random_song/guess_neb_single';
  $args = '?views-argument[0]=' . $songId . '&include=field_album_id,field_album_id.field_album_cover,field_artist_id';
}
// creating new solution
else {
  $url .= '/jsonapi/views/random_song/guess_neb';
  $args = '?include=field_album_id,field_album_id.field_album_cover,field_artist_id';
}

if (!empty($args)) {
  $url .= $args;
}

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$song = curl_exec($ch);

curl_close($ch);

if ($song) {
  echo $song;
} else {
  echo json_encode(array(
    'message' => 'Could not get random song',
    'status' => 'error',
    'url' => $url
  ));
}

?>
