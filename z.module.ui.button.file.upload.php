<?php

function formUpload($inputname = ''){

	if(empty($inputname))return;

	$data = (object) array(
		'success' => TRUE,
		'message' => isset($_POST['message'])?trim($_POST['message']):'',
		'successfiles' => array()
	);
	
	$files = $_FILES[$inputname];

	// kiem tra xem co file nao khong
	if(count($files)<=0)
		return json_encode($data);

	// kiem tra xem up 1 file hay nhieu file
	$multiple = is_array($files['name']);

	// neu nhu up 1 file thoi
	if(!$multiple){
		$data->successfiles[] = array(
			'name'=> $files['name'], 
			'type'=> $files['type'], 
			'tmp_name'=> $files['tmp_name'], 
			'error'=> $files['error'],
			'size'=> $files['size']
		);
	}

	// neu nhu up nhieu file
	if($multiple){
		foreach($files['error'] as $i => $error){
			if($error == UPLOAD_ERR_OK){
				$data->successfiles[] = array(
					'name'=> $files['name'][$i], 
					'type'=> $files['type'][$i], 
					'tmp_name'=> $files['tmp_name'][$i], 
					'size'=> $files['size'][$i]
				);
			}
		}
	}
	
	return json_encode($data);
}

//header('Content-Type:application/json; charset=UTF-8');
header('Content-Type:text/html; charset=UTF-8');
echo formUpload('filesupload');