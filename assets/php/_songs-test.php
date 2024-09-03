<?php

$url = 'https://music.nebyoolae.com/jsonapi/views/songs/songs_all?include=field_album_id,field_album_id.field_album_cover,field_artist_id';

$options[CURLOPT_URL] = $url;

$options[CURLOPT_PORT] = 443;
$options[CURLOPT_FRESH_CONNECT] = true;
$options[CURLOPT_FOLLOWLOCATION] = false;
$options[CURLOPT_FAILONERROR] = true;
$options[CURLOPT_RETURNTRANSFER] = true; // curl_exec will not return true if you use this, it will instead return the request body
$options[CURLOPT_TIMEOUT] = 10;

// Preset $response var to false and output
$fb = "";
$response = false; // don't quote booleans
echo 'response1: ' . ($response == true ? "yay\n" : "boo\n");

$curl = curl_init();
curl_setopt_array($curl, $options);

// If curl request returns a value, I set it to the var here.
// If the file isn't found (server offline), the try/catch fails and var should stay as false.
$fb = curl_exec($curl);
curl_close($curl);

if ($fb !== false) {
  echo 'response2: ' . $fb;
  $response = $fb;
}

// If cURL was successful, $response should now be true, otherwise it will have stayed false.
echo 'response3: ' . ($response == true ? "yay\n" : "boo\n");
