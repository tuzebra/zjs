<?php


ini_set('display_errors', 1);

function files(){
	
	//
	if(!isset($_FILES) OR !is_array($_FILES))$_FILES = array();
	$_files = array();
	
	// bay gio se di loc ra tat ca moi file uplen luon
	foreach($_FILES as $inputname => $files){
		
		// kiem tra xem up 1 file hay nhieu file
		$multiple = is_array($files['name']);
		
		// neu nhu up 1 file thoi
		if(!$multiple){
			$_files[] = (object) array(
				'inputname' => $inputname,
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
				$_files[] = (object) array(
					'inputname' => $inputname,
					'name'=> $files['name'][$i], 
					'type'=> $files['type'][$i], 
					'tmp_name'=> $files['tmp_name'][$i], 
					'error'=> $files['error'][$i],
					'size'=> $files['size'][$i]
				);
			}
		}
		
	}
	
	// done!
	return $_files;
}


function successFiles(){
	
	//
	$_successfiles = array();
	
	$_files = files();
	foreach($_files as $file)
		if($file->error == UPLOAD_ERR_OK)
			$_successfiles[] = $file;
	
	// done!
	return $_successfiles;
}




// get ra tat ca cac file upload len thanh cong
$successImages = successFiles();

if(!is_array($successImages) OR count($successImages) < 1){
	echo json_encode(array('error'=>'upload failed'));
	die;
}

// chi lay ra 1 file duy nhat
$file = $successImages[0];

move_uploaded_file($file->tmp_name, 'images/'.$file->name);


echo json_encode(array(
	'success'=>TRUE,
	'files'=>array(
		(object) array(
			'id' => $file->name,
			'url' => 'http://app.april.com.vn/zjs/vers/1.1/test/images/'.$file->name
		)
	)
));



