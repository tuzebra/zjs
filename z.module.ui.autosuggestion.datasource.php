<?php 

$q = trim($_GET['q']);

if(empty($q)){
	echo json_encode([
		"result" => "OK",
		"data" => [
			[
				"name" => "Cat Handmade Rope Bracelet",
				"homeUrl" => "abcd",
			]
		]
	]);
}

elseif($q == 'k'){
	sleep(2);
	echo json_encode([
		"result" => "OK",
		"data" => [
			[
				"name" => "Kitchen Adjustable Water-saving Faucet",
				"homeUrl" => "kitchen",
			]
		]
	]);
}