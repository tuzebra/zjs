<?php

function jsonp_encode($data, $rid=-1){
	
	if($rid<0)$rid = intval($_REQUEST['zjsonprid']);
	
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: text/javascript');

	if(is_array($data))$data = (object) $data;

	return 'zjs.jsonpcallback('.json_encode($data).','.$rid.');';
	
}


$data['name'] = $_REQUEST['name'];
$data['age'] = $_REQUEST['age'];

// normal xhr
echo json_encode($data);

// jsonp
//echo jsonp_encode($data);