<?php

$env = isset($_REQUEST['env']) ? $_REQUEST['env'] : 'local';
// https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/api-overview
// $url = $env == 'prod' ? 'https://music.nebyoolae.com' : 'https://muzcom-web.ddev.site';
$url = 'https://music.nebyoolae.com';
$url .= '/jsonapi/views/songs/songs_neb';
$args = '?include=field_album_id,field_album_id.field_album_cover,field_artist_id';

if (!empty($args)) {
  $url .= $args;
}

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$songs = curl_exec($ch);

curl_close($ch);

if ($songs) {
  echo $songs;
} else {
  echo json_encode(array(
    'message' => 'Could not get songs',
    'status' => 'error',
    'url' => $url,
  ));
}

?>
