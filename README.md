## Motor tlanni tlanlohni app (Android 7+)

To run this app or produce an apk, follow the steps - 
* Clone this repo
<pre>
	cd tlanni
	npm install
	npm run build
</pre>
* Assuming you have cordova, create a cordova project and move the *_tlanni/dist_* folder contents to *_{cordova project name}/www_* folder
* Assuming you have androidSDK, gradle, and java jdk installed
<pre>
	cordova build android	
</pre>
* This will run the build and output an sdk which you can copy to your phone and install.