<?php

$files = array();
foreach(glob('*.{js,css,html}', GLOB_BRACE) as $filename)
	$files[] =  $filename;
sort($files);

$jsFiles = array();
foreach(glob('*[^.min].js', GLOB_BRACE) as $filename)
	$jsFiles[] =  $filename;
sort($jsFiles);

$showedFiles = array();

$cache_expire = 60*60*24*30; // 30days (60sec * 60min * 24hours * 30days)
header('Pragma: public');
header('Cache-Control: max-age='.$cache_expire);
header('Expires: ' . gmdate('D, d M Y H:i:s', time()+$cache_expire) . ' GMT');

$hiddenFiles = array(
	'index.html',
	'_index.html',
	'modules.js',
	'z.module.april.like.js',
	'z.module.april.like.css',
	'z.module.april.like.html',
	'z.module.image.slider.theme.simpleswipe.js',
	'z.module.image.slider.theme.simpleswipe.css',
	'z.module.image.slider.theme.simpleswipe.html',
	'z.module_.__autosuggestion.js',
	'z.module_.__autosuggestion.css',
	'z.module_.__input.date.css',
	'z.module_.__input.date.html',
	'z.module_.__input.date.js',
	'z.module_.__input.select.js',
	'z.module_.___popup.css',
	'z.module_.___popup.html',
	'z.module_.__basic_template__.js',
	'z.module_.__delete__popup.js',
	'z.module_.__template__.js',
	'z.module_.__uploadbutton.css',
	'z.module_.__uploadbutton.html',
	'z.module_.__uploadbutton.js'
);

$modules = array(
	'z' => 'ZJS Core, lightweight, autoload modules feature, build-in mobile event,...',
	'z.module.autodetect' => 'Detect & testing browser',
	// 'z.module.bin.scrollto' => 'Smoothly scroll, author @Binbin',
	// 'z.module.codeeditor' => 'Code editor',
	// 'z.module.dictionary' => 'Provide Dictionary that allow very fast search method',
	// 'z.module.editor' => 'WYSIWYG editor',
	// 'z.module.encoder' => 'Provide md5, sha1 method',
	'z.module.form.validation' => 'Provide Form validation interface & api',
	'z.module.image.crop' => 'Cropping image UI',
	'z.module.image.resize' => 'Resize image UI',
	'z.module.image.loader' => 'Provide preload image method',
	'z.module.image.slider' => 'Image slider module, provide core function to integrated',
	'z.module.image.slider.theme.simple' => 'Simple and effective. If you need a image slider that just work, fast, responsive, touch gestures support, easy to custom animation (because it build 99% using css), this is the best option.',
	'z.module.image.slider.theme.linear' => 'Linear theme for Image slider module, with a lot of option and easy for customization',
	'z.module.pagepreload' => 'Pagepreload, it provide UI for splash screen show loading-percent before access website',
	'z.module.parallax' => 'Parallax module that help build parallax website easy',
	'z.module.scrollbar' => 'Custom scrollbar, easy to style, mobile friendly',
	'z.module.ui.accordion' => 'Accordion',
	'z.module.ui.autosuggestion' => 'Autosuggestion, that make any input element become an auto-suggess input',
	'z.module.ui.button.file' => 'Custom Button file that help styling easy, support draw and drop, powerful api',
	'z.module.ui.checkbox' => 'Checkbox',
	'z.module.ui.radio' => 'Radio',
	'z.module.ui.slider' => 'Slider, a simple number slider',
	'z.module.ui.datepicker' => 'Datepicker, easy to use, support multi language, ton of option and api',
	'z.module.ui.selectbox' => 'Selectbox',
	'z.module.ui.hovercard' => 'Hovercard',
	'z.module.ui.freezepanel' => 'Freeze panel, super smoothly and powerful sticky module',
	'z.module.ui.imagepicker' => 'Pick and upload an image so easy with Image Picker, it base on top of button.file api',
	'z.module.ui.textarea.autoheight' => 'Make textarea auto resize its height to fix content',
	'z.module.ui.sizeadaptable' => 'Size-Adaptable, if you build responsive website, you will need it',
	'z.module.ui.popup' => 'Powerful Popup, with a lot of options, easy to use api, super cool build-in animation',
	'z.module.ui.toc' => 'Table of content',
	'z.module.ui.readmore' => 'Readmore',
	'z.module.ui.tabpanel' => 'Tabpanel',
	'z.module.ui.header' => 'Header, build site header never easy like this, with mobile hambuger button supporting, beautiful animation, but still extendable.',
	'z.module.chartist' => 'Chartist',
	'z.module.codemirror' => 'Codemirror',
	'z.module.transition' => 'Transition, the most important module, with it build a animation effect not a challenge anymore'
);

?>
<html>
<style>
body{
	font-family: "Trebuchet MS", "Lucida Sans", "Lucida Grande", Arial, Helvetica, sans-serif;
}
h1{
    margin-top: 2em;
}
</style>
<body>

	<?php /*<p>Download: <a href="src.zip">src.zip</a></p>*/ ?>
	<p>Git: <a href="https://github.com/tuzebra/zjs">https://github.com/tuzebra/zjs</a></p>

	<?php /*
	<h1>src/</h1>
	<p>sort a->z</p>
	*/ ?>



	<?php
	// Knowed what module to show
	foreach($modules as $file => $name):
		if(in_array($file, $hiddenFiles))continue;
		$showedFiles[] = $file.'.js';
	?>
		<h1><?php echo $name;?></h1>
		<b>source:</b>
		<ul>
			<li><a href="<?php echo $file.'.js';?>"><?php echo $file.'.js';?></a></li>

			<?php
			// check min file
			if(in_array($file.'.min.js', $files) AND !in_array($file.'.min.js', $showedFiles)):
				$showedFiles[] = $file.'.min.js';
			?>
				<li><a href="<?php echo $file.'.min.js';?>"><?php echo $file.'.min.js';?></a></li>
			<?php endif;?>

			<?php
			// check css file
			if(in_array($file.'.css', $files) AND !in_array($file.'.css', $showedFiles)):
				$showedFiles[] = $file.'.css';
			?>
				<li><a href="<?php echo $file.'.css';?>"><?php echo $file.'.css';?></a></li>
			<?php endif;?>
		</ul>



		<?php
		// xem coi co child module hay khong?
		$childjsFiles = array();
		if($file != 'z'){
			foreach(glob($file.'.*[^min].{js,css}', GLOB_BRACE) as $filename)
				$childjsFiles[] = $filename;
		}
		if($file == 'z.module.editor')
			$childjsFiles[] = 'z.module.editor.custom.css';
		sort($childjsFiles);
		if(count($childjsFiles)):?>
			<b>child modules:</b>
			<ul>
			<?php
			foreach($childjsFiles as $childjsFile):
				if($childjsFile == 'z.module.image.slider.theme.simple.js')continue;
				if($childjsFile == 'z.module.image.slider.theme.simple.min.js')continue;
				if($childjsFile == 'z.module.image.slider.theme.linear.js')continue;
				if($childjsFile == 'z.module.image.slider.theme.linear.min.js')continue;
				if(!in_array($childjsFile, $showedFiles) AND !in_array($childjsFile, $hiddenFiles)):
					$showedFiles[] = $childjsFile;
			?>
				<li><a href="<?php echo $childjsFile;?>"><?php echo $childjsFile;?></a></li>
				<?php endif;?>
			<?php endforeach;?>
		</ul>
		<?php endif;?>



		<?php
		// xem coi co demo file hay khong?
		$htmlFiles = array();
		if($file == 'z'){
			foreach(glob($file.'.js.test*.html', GLOB_BRACE) as $filename)
				$htmlFiles[] = $filename;
		}
		elseif($file == 'z.module.image.slider'){
			$htmlFiles[] = 'z.module.image.slider.html';
		}
		else{
			foreach(glob($file.'*.html', GLOB_BRACE) as $filename)
				$htmlFiles[] = $filename;
		}

		sort($htmlFiles);
		// fix after sort
		if($file == 'z')
			$htmlFiles = array_merge(array('z.js.test.html'), $htmlFiles);
		if($file == 'z.module.image.slider.theme.linear'){
			$htmlFiles = array_merge(array(
				'z.module.image.slider.theme.linear.html'
			), $htmlFiles);
		}
		if($file == 'z.module.image.slider.theme.simple'){
			$htmlFiles = array_merge(array(
				'z.module.image.slider.theme.simple.html'
			), $htmlFiles);
		}

		if(count($htmlFiles)):?>
			<b>demo:</b>
			<ul>
			<?php
			foreach($htmlFiles as $htmlFile):
				if(!in_array($htmlFile, $showedFiles) AND !in_array($htmlFile, $hiddenFiles)):
					$showedFiles[] = $htmlFile;
			?>
				<li><a href="<?php echo $htmlFile;?>"><?php echo $htmlFile;?></a></li>
				<?php endif;?>
			<?php endforeach;?>
		</ul>
		<?php endif;?>


	<?php endforeach;?>



	<h1>#Other files</h1>
	<ul>
		<?php
		// Other
		foreach($files as $file):
			if(!in_array($file, $showedFiles) AND !in_array($file, $hiddenFiles)):
		?>
			<li><a href="<?php echo $file;?>"><?php echo $file;?></a></li>
		<?php endif;?>
		<?php endforeach;?>
	</ul>


</body>
</html>