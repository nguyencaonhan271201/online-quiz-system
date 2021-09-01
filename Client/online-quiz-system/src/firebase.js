import firebase from 'firebase';
var firebaseConfig = {
    apiKey: "AIzaSyAHKZmrsppTSsoTjBUFavB73Xcyvcr_FoI",
    authDomain: "online-quiz-system-59fe8.firebaseapp.com",
    projectId: "online-quiz-system-59fe8",
    storageBucket: "online-quiz-system-59fe8.appspot.com",
    messagingSenderId: "1055838775",
    appId: "1:1055838775:web:821208523ecaba463965b2"
};
firebase.initializeApp(firebaseConfig);
var storage = firebase.storage();
export default storage;