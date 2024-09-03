<?php

$songId = isset($_REQUEST['songId']) ? $_REQUEST['songId'] : '';

$ch = curl_init();
// https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/api-overview
// $url = $env == 'prod' ? 'https://music.nebyoolae.com' : 'https://muzcom-web.ddev.site';
$url = 'https://music.nebyoolae.com';
$url .= '/jsonapi/views/random_song/guess_neb_single_songid?views-argument[0]=' . $songId . '&include=field_album_id,field_album_id.field_album_cover,field_artist_id';

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$song = curl_exec($ch);

curl_close($ch);

if ($song) {
  echo $song;
} else {
  echo json_encode(array(
    'message' => 'Could not get song title from songId',
    'status' => 'error',
    'url' => $url
  ));
}

?>
