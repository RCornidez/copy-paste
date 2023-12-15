<h1>Copy/Paste 📋</h1>

<p>A WebRTC powered temporary clipboard to seamlessly share text and files between devices.</p>
<p><a href="https://color.cornidez.com/" target="_blank">Demo</a></p>
<p><a href="https://color.cornidez.com/quickstart.html" target="_blank">Quickstart guide</a></p>
<p><a href="https://color.cornidez.com/overview.html" target="_blank">Project overview</a></p>
<p><a href="https://color.cornidez.com/privacy.html" target="_blank">Privacy Policy</a></p>


<h3>How-to-run:</h3>
<ol>
    <li>Download <a href="https://github.com/RCornidez/copy-paste">Github</a> repository.</li>
    <li>Run: `npm install` within the root of directory to install dependencies.</li>
    <li>Setup a <a href="#firestore">google firestore per the notes below</a>. This will be your signaling server that assists with making the WebRTC connections.</li>
    <li>Create a <a href="#env">.env file per the notes below.</a></li>
    <li>Configure the IP Address or Domain (and Port if locally hosted) in the "url" variable within /public/index.js. This is for the API URL where the client code will be making requests for the Firestore signal server routes. It depends where the application is hosted.<br/>127.0.0.1- localhost/local machine.<br/>0.0.0.0 - all of your local network interfaces (including localhost).<br/>Public IP || Domain - If the application is served publicly.</li>
    <li>Run: `npm run dev` for testing</li>
    <li>Access via the IP Address and Port set within the .env file - <a href="http://127.0.0.1:4000/" target="_blank">http://127.0.0.1:4000/</a></li>
    <li>Deploying will require you to:
        <ul><li>containerize the application, create a service, or use a service library like pm2.</li>
            <li>Configure CORS properly.</li>
        </ul></li>
</ol>
<hr/>

<h3>Directory Tree</h3>

```
.
├── LICENSE
├── README.md
├── components
│   ├── firestore.js
│   └── webpages.js
├── package.json
├── public
│   ├── WebRTC_Logo.svg
│   ├── container.js
│   ├── index.css
│   ├── index.html
│   ├── index.js
│   ├── overview.html
│   ├── privacy.html
│   └── quickstart.html
└── server.js
```
<hr/>

<h3 id="firestore">Google Firestore:</h3>
<ol>
<li>Create an account with <a href="https://firebase.google.com/">Firebase</a></li>
<li>Go to console (should be on the top right within the Navigation bar)</li>
<li>Create a new project.</li>
<li>Create a Firestore database (under build in side navigation) - Start in test mode, you can change to production later if you deploy.</li>
<li>Create the root collection and name it "calls".</li>
<li>Add a document within the "calls" collection - enable auto-id and set two fields named "answer" and "offer" the values for these will be strings. Leave them blank. All remaining fields and subcollections will be auto-created when the API requests are made.</li>
<li>Click on Project Overview (at the top of the side navigation).</li>
<li>Add a Web app and give it a name.</li>
<li>Copy the firebase config and set it within a .env file in the root of the directory.</li>
<li>The Firestore Database is now ready for requests.</li>
</ol>

<hr/>

<h3 id="env">Environment Variables (.env) file:</h3>
Assign the following values within the .env file. You'll have to put your unique Firestore details that you received when creating an app on your Firestore database.


```
# Firestore API details
APIKEY=BIzaSyCDnusjr9l9m_DYzy0jJnL52TBI-QrrT10
AUTHDOMAIN=ready-1012f.firebaseapp.com
PROJECTID=copy-1035f
STORAGEBUCKET=paste-1032f.appspot.com
MESSAGINGSENDERID=80469571241
APPID=1:80179552041:web:f23e742643389a58ddff38

# Applications Port and IP Address
IP=127.0.0.1
PORT=4000

```
<hr/>
