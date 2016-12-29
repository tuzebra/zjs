<?php

$files = array();
foreach(glob('z.module.*.{js,css}', GLOB_BRACE) as $filename)
	$files[] =  str_replace('z.module.', '', $filename);

sort($files);

$cache_expire = 60*60*24*30; // 30days (60sec * 60min * 24hours * 30days)
header('Pragma: public');
header('Cache-Control: max-age='.$cache_expire);
header('Expires: ' . gmdate('D, d M Y H:i:s', time()+$cache_expire) . ' GMT');
header('Content-type:text/javascript; charset=UTF-8');
echo 'zjs.requireListCallback('. json_encode($files), ');';